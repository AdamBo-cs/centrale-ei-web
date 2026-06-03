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

# extraction des données
movies = pd.read_sql_query("SELECT id, name, synopsis, date, original_language FROM movie", conn)

# # Sécurité : Remplacement des valeurs manquantes
# df_movies['title'] = df_movies['title'].fillna('')
# df_movies['synopsis'] = df_movies['synopsis'].fillna('')
# df_movies['release_date'] = df_movies['release_date'].fillna('00-00-0000')
# df_movies['original_language'] = df_movies['original_language'].fillna('fr')


textes_enrichis = []

for index, row in movies.iterrows():
    titre = row['name']
    synopsis_original = row['synopsis']
    langue = row['original_language'].lower()
    date = row['date']
    
    # extraction de l'année
    elements_date = date.split('-')
    annee = elements_date[-1] if len(elements_date) == 3 else "0000"
    
    # création des étiquettes de métadonnées
    balise_annee = f"Annee_{annee}"
    balise_langue = f"Langue_{langue}"
    
    # ajout du titre
    titre_nettoye = titre.lower()
    titre_renforce = f"{titre_nettoye} {titre_nettoye} {titre_nettoye}"
    
    # fusion de toutes les infos
    texte_combine = f"{titre_renforce} {synopsis_original} {balise_annee} {balise_langue}"
    textes_enrichis.append(texte_combine)

mots_vides=[
    'au', 'aux', 'avec', 'ce', 'ces', 'dans', 'de', 'des', 'du', 'elle', 'en', 'et', 
    'eux', 'il', 'ils', 'je', 'la', 'le', 'les', 'leur', 'lui', 'ma', 'mais', 'me', 
    'même', 'mes', 'moi', 'mon', 'ne', 'nos', 'notre', 'nous', 'on', 'ou', 'par', 
    'pas', 'pour', 'qu', 'que', 'qui', 'sa', 'se', 'ses', 'son', 'sur', 'ta', 'te', 
    'tes', 'toi', 'ton', 'tu', 'un', 'une', 'vos', 'votre', 'vous', 'c', 'd', 'j', 
    'l', 'm', 'n', 's', 't', 'y', 'été', 'étée', 'étées', 'étés', 'étant', 'étante', 
    'étantes', 'étants', 'étions', 'étiez', 'étaient', 'aurai', 'auras', 'aura', 'aurons', 
    'aurez', 'auront', 
    'aurais', 'aurait', 'aurions', 'auriez', 'auraient', 'avais', 'avait', 'avions', 
    'aviez', 'avaient', 'eut', 'eûmes', 'eûtes', 'eurent', 'suis', 'es', 'est', 'sommes', 
    'êtes', 'sont', 'sois', 
    'soit', 'soyons', 'soyez', 'soient','ai', 'as', 'avons', 'avez', 'ont', 'aie', 'aies',
    'ait', 
    'ayons', 'ayez', 'aient', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent']

vectorizer = TfidfVectorizer(stop_words=mots_vides, max_features=5000) 
X_tfidf = vectorizer.fit_transform(textes_enrichis)

n_composantes = 30  
svd = TruncatedSVD(n_components=n_composantes, random_state=42)
X_reduit = svd.fit_transform(X_tfidf)

print(X_reduit)

for index, row in movies.iterrows():
    movie_id = int(row['id'])
    
    # conversion du tableau numpy en liste classique puis en JSON
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

