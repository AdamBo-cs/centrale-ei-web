import os
import sqlite3
import json
import numpy as np
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database.sqlite3')

def calculer_cosinus(vect_a, vect_b):
    a = np.array(vect_a)
    b = np.array(vect_b)
    dot = np.dot(a, b)
    norme_a = np.linalg.norm(a)
    norme_b = np.linalg.norm(b)
    if norme_a == 0 or norme_b == 0:
        return 0.0
    return dot / (norme_a * norme_b)

# Mode 1 : Recommandation basée sur un film cible
def recommander_top_5(movie_id_cible):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name, vecteur_contenu FROM movie WHERE id = ?", (movie_id_cible,))
    resultat_cible = cursor.fetchone()
    if not resultat_cible or not resultat_cible[1]:
        conn.close()
        return []
        
    vecteur_cible = json.loads(resultat_cible[1])
    cursor.execute("SELECT id, vecteur_contenu FROM movie WHERE id != ?", (movie_id_cible,))
    tous_les_films = cursor.fetchall()
    
    scores_similarite = []
    for film_id, vecteur_brut in tous_les_films:
        if vecteur_brut:  
            score = calculer_cosinus(vecteur_cible, json.loads(vecteur_brut))
            scores_similarite.append((film_id, score))
            
    conn.close()
    scores_tries = sorted(scores_similarite, key=lambda x: x[1], reverse=True)
    return [film_id for film_id, score in scores_tries[:5]]


# Mode 2 : Recommandation basée sur le profil brut de l'utilisateur
def recommander_pour_utilisateur(user_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. On récupère le vecteur de profil de l'utilisateur
    cursor.execute("SELECT vecteur_profil FROM user WHERE id = ?", (user_id,))
    resultat_user = cursor.fetchone()
    
    if not resultat_user or not resultat_user[0]:
        conn.close()
        return [] # Pas encore de vecteur profil
        
    vecteur_utilisateur = json.loads(resultat_user[0])
    
    # On récupère les IDs des films déjà notés par l'utilisateur
  
    cursor.execute("SELECT movieId FROM rating WHERE userId = ?", (user_id,))
    notes_existantes = cursor.fetchall()
    # On crée un "set" d'IDs pour une recherche ultra-rapide (ex: {12, 45})
    ids_films_notes = {int(row[0]) for row in notes_existantes if row[0] is not None}
    
    # 2. On récupère tous les films disponibles
    cursor.execute("SELECT id, vecteur_contenu FROM movie")
    tous_les_films = cursor.fetchall()
    
    scores_similarite = []
    for film_id, vecteur_brut in tous_les_films:
        # FILTRE D'EXCLUSION : Si le film est déjà noté, on l'ignore !
        if film_id in ids_films_notes:
            continue
            
        if vecteur_brut:
            vecteur_film = json.loads(vecteur_brut)
            score = calculer_cosinus(vecteur_utilisateur, vecteur_film)
            scores_similarite.append((film_id, score))
            
    conn.close()
    
    # 3. Tri par score décroissant et sélection du Top 5
    scores_tries = sorted(scores_similarite, key=lambda x: x[1], reverse=True)
    top_5_user_ids = [film_id for film_id, score in scores_tries[:5]]
    
    return top_5_user_ids

# Mode 3 : Recommandation pour un duo
def recommander_pour_duo(user_id_1, user_id_2):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Récupérer le vecteur du premier utilisateur
    cursor.execute("SELECT vecteur_profil FROM user WHERE id = ?", (user_id_1,))
    res1 = cursor.fetchone()
    
    # 2. Récupérer le vecteur du deuxième utilisateur
    cursor.execute("SELECT vecteur_profil FROM user WHERE id = ?", (user_id_2,))
    res2 = cursor.fetchone()
    
    # Si l'un des deux n'a pas de profil, on ne peut pas faire de duo
    if not res1 or not res1[0] or not res2 or not res2[0]:
        conn.close()
        return []
        
    # Chargement en tableaux numpy
    v1 = np.array(json.loads(res1[0]))
    v2 = np.array(json.loads(res2[0]))
    
    # SÉCURITÉ : Normalisation L2 de chaque vecteur pour donner le même poids aux deux utilisateurs
    norme_v1 = np.linalg.norm(v1)
    norme_v2 = np.linalg.norm(v2)
    
    if norme_v1 > 0:
        v1 = v1 / norme_v1
    if norme_v2 > 0:
        v2 = v2 / norme_v2
        
    vecteur_duo = v1 + v2
    
    # 3. On récupère les films déjà vus/notés par l'un OU l'autre
    cursor.execute("SELECT movieId FROM rating WHERE userId IN (?, ?)", (user_id_1, user_id_2))
    films_vus = cursor.fetchall()
    ids_a_exclure = {int(row[0]) for row in films_vus if row[0] is not None}
    
    # 4. Comparaison par cosinus avec tous les films de la DB
    cursor.execute("SELECT id, vecteur_contenu FROM movie")
    tous_les_films = cursor.fetchall()
    
    scores_similarite = []
    for film_id, vecteur_brut in tous_les_films:
        if film_id in ids_a_exclure:
            continue
            
        if vecteur_brut:
            vecteur_film = json.loads(vecteur_brut)
            score = calculer_cosinus(vecteur_duo, vecteur_film)
            scores_similarite.append((film_id, score))
            
    conn.close()
    
    # Tri et renvoi du Top 5 pour le duo
    scores_tries = sorted(scores_similarite, key=lambda x: x[1], reverse=True)
    return [film_id for film_id, score in scores_tries[:5]]

# Point d'entrée pour intercepter les requêtes de Node.js
if __name__ == "__main__":
    # Si on a assez d'arguments pour le mode duo (ex: python recommendation.py duo 3 5)
    if len(sys.argv) > 3 and sys.argv[1] == 'duo':
        uid1 = int(sys.argv[2])
        uid2 = int(sys.argv[3])
        print(json.dumps(recommander_pour_duo(uid1, uid2)))
            
    # Si on a assez d'arguments pour les modes classiques 'user' et 'movie'
    elif len(sys.argv) > 2:
        mode = sys.argv[1]
        id_cible = int(sys.argv[2])
        
        if mode == 'user':
            print(json.dumps(recommander_pour_utilisateur(id_cible)))
        else:
            print(json.dumps(recommander_top_5(id_cible)))
            
    # Si aucun argument ou format invalide
    else:
        print(json.dumps([]))