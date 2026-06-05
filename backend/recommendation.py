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
        # 💾 FILTRE D'EXCLUSION : Si le film est déjà noté, on l'ignore !
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

# Point d'entrée pour intercepter les requêtes de Node.js
if __name__ == "__main__":
    if len(sys.argv) > 2:
        try:
            mode = sys.argv[1]       # 'movie' ou 'user'
            id_cible = int(sys.argv[2]) # ID associé
            
            if mode == 'user':
                print(json.dumps(recommander_pour_utilisateur(id_cible)))
            else:
                print(json.dumps(recommander_top_5(id_cible)))
        except Exception as e:
            print(json.dumps([]))
    else:
        print(json.dumps([]))