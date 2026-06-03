import os
import sqlite3
import json
import numpy as np

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


def recommander_top_5(movie_id_cible):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name, vecteur_contenu FROM movie WHERE id = ?", (movie_id_cible,))
    resultat_cible = cursor.fetchone()
    
    if not resultat_cible or not resultat_cible[1]:
        print(f"Film cible avec l'ID {movie_id_cible} introuvable ou non vectorisé.")
        conn.close()
        return []
        
    titre_cible = resultat_cible[0]
    vecteur_cible = json.loads(resultat_cible[1])
    
    cursor.execute("SELECT id, name, vecteur_contenu FROM movie WHERE id != ?", (movie_id_cible,))
    tous_les_films = cursor.fetchall()
    
    scores_similarite = []
    
    for film_id, titre, vecteur_brut in tous_les_films:
        if vecteur_brut:  
            vecteur_candidat = json.loads(vecteur_brut)
            score = calculer_cosinus(vecteur_cible, vecteur_candidat)
            scores_similarite.append((film_id, titre, score))
            
    conn.close()
    

    # tri des films en fonction de leur score
    scores_tries = sorted(scores_similarite, key=lambda x: x[2], reverse=True)
    top_5 = scores_tries[:5]
    
    # affichage des films similaires
    print(f"\n--- Films similaires à : {titre_cible} ---")
    for rang, (film_id, titre, score) in enumerate(top_5, 1):
        print(f"{rang}. {titre} (Score de proximité : {score:.3f})")
        
    return top_5

recommander_top_5(100)