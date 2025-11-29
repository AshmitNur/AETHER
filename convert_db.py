import sqlite3
import json
import os

def dump_db(db_path, output_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        db_dump = {}
        
        for table_name in tables:
            table = table_name[0]
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            
            # Get column names
            col_names = [description[0] for description in cursor.description]
            
            table_data = []
            for row in rows:
                table_data.append(dict(zip(col_names, row)))
                
            db_dump[table] = table_data
            
        conn.close()
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(db_dump, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully dumped {db_path} to {output_path}")
        
    except Exception as e:
        print(f"Error dumping database: {e}")

if __name__ == "__main__":
    dump_db('Data/students.db', 'public/Data/students_db.json')
