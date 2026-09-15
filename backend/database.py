import os
from sqlalchemy import create_engine
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def load_csv_to_db():
    df = pd.read_csv("finances_data.csv")
    df.to_sql("indicateurs", engine, if_exists="replace", index=False)
    print(f"{len(df)} lignes chargées dans la base Supabase")

if __name__ == "__main__":
    load_csv_to_db()