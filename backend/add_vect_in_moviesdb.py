import os
import sqlite3
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database.sqlite3')

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# pragma permet d'inspecter la structure de la db
cursor.execute("PRAGMA table_info(movie);")
colonnes = [colonne[1] for colonne in cursor.fetchall()]

if 'vecteur_contenu' not in colonnes:
    cursor.execute("ALTER TABLE movie ADD COLUMN vecteur_contenu TEXT;")
    conn.commit()

# Extraction des données de la table movie
movies = pd.read_sql_query("SELECT id, name, synopsis, date, original_language, genres, actors, director, keywords FROM movie", conn)

# si on a un NaN dans le tableau, on le remplace
movies['name'] = movies['name'].fillna('')
movies['synopsis'] = movies['synopsis'].fillna('')
movies['date'] = movies['date'].fillna('00-00-0000')
movies['original_language'] = movies['original_language'].fillna('en')
movies['genres'] = movies['genres'].fillna('')
movies['actors'] = movies['actors'].fillna('')
movies['director'] = movies['director'].fillna('')
movies['keywords']== movies['keywords'].fillna('')

textes_enrichis = []

for index, row in movies.iterrows():
    titre = row['name']
    synopsis_original = row['synopsis']
    langue = row['original_language'].lower()
    date = row['date']
    genres = row['genres']
    acteurs = row['actors']
    realisateur = row['director']
    keywords=row['keywords']

    # Extraction de l'année
    elements_date = date.split('-')
    annee = elements_date[-1] if len(elements_date) == 3 else "0000"
    
    # Création des étiquettes de métadonnées
    balise_annee = f"Annee_{annee}"
    balise_langue = f"Langue_{langue}"
    
    # Ajout et renforcement du titre
    titre_nettoye = titre.lower()
    titre_renforce = f"{titre_nettoye} {titre_nettoye} {titre_nettoye}"
    
    genres_nettoyes = genres.lower()
    genres_renforce=f"{genres_nettoyes} {genres_nettoyes} {genres_nettoyes}"

    acteurs_nettoyes = acteurs.lower()
    realisateur_nettoye = f"{realisateur.lower()} {realisateur.lower()} {realisateur.lower()}"

    
    keywords_nettoyes=keywords.lower()
    keywords_renforce=f"{keywords_nettoyes} {keywords_nettoyes} {keywords_nettoyes}"

    # Fusion de toutes les infos (Titre + Synopsis + Catégories + Métadonnées)
    # L'algorithme prend désormais en compte l'univers complet du film
    texte_combine = f"{titre_renforce} {keywords_renforce}{synopsis_original} {genres_renforce} {acteurs_nettoyes} {realisateur_nettoye} {balise_annee} {balise_langue}"
    textes_enrichis.append(texte_combine)

mots_vides = [
    'au', 'aux', 'avec', 'ce', 'ces', 'dans', 'de', 'des', 'du', 'elle', 'en', 'et', 
    'eux', 'il', 'ils', 'je', 'la', 'le', 'les', 'leur', 'lui', 'ma', 'mais', 'me', 
    'même', 'mes', 'moi', 'mon', 'ne', 'nos', 'notre', 'nous', 'on', 'ou', 'par', 
    'pas', 'pour', 'qu', 'que', 'qui', 'sa', 'se', 'ses', 'son', 'sur', 'ta', 'te', 
    'tes', 'toi', 'ton', 'tu', 'un', 'une', 'vos', 'votre', 'vous', 'c', 'd', 'j', 
    'l', 'm', 'n', 's', 't', 'y', 'été', 'étée', 'étées', 'étés', 'étant', 'étante', 
    'étantes', 'étants', 'étions', 'étiez', 'étaient', 'aurai', 'auras', 'aura', 'aurons', 
    'aurez', 'auront', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient', 'avais', 
    'avait', 'avions', 'aviez', 'avaient', 'eut', 'eûmes', 'eûtes', 'eurent', 'suis', 
    'es', 'est', 'sommes', 'êtes', 'sont', 'sois', 'soit', 'soyons', 'soyez', 'soient', 
    'ai', 'as', 'avons', 'avez', 'ont', 'aie', 'aies', 'ait', 'ayons', 'ayez', 'aient', 
    'eus', 'eut', 'eûmes', 'eûtes', 'eurent'
]

# Vectorisation TF-IDF (Nettoyage automatique des mots vides)
vectorizer = TfidfVectorizer(stop_words=mots_vides) 
X_tfidf = vectorizer.fit_transform(textes_enrichis)

# Réduction de dimension (SVD)
n_composantes = 50  
svd = TruncatedSVD(n_components=n_composantes, random_state=0)
X_reduit = svd.fit_transform(X_tfidf)

print("Matrice des vecteurs générée avec succès.")

# Mise à jour de la base de données
for index, row in movies.iterrows():
    movie_id = int(row['id'])
    
    # Conversion du tableau numpy en liste classique puis en JSON
    vecteur_film = X_reduit[index].tolist() 
    vecteur_json = json.dumps(vecteur_film)
    
    # Mise à jour de la ligne du film
    cursor.execute(
        "UPDATE movie SET vecteur_contenu = ? WHERE id = ?",
        (vecteur_json, movie_id)
    )

conn.commit()
cursor.close()
conn.close()
print("Base de données mise à jour !")