python -m venv .venv
source .venv/bin/activate

pip install -r .\requirements.txt 
python -m spacy download en_core_web_md
uvicorn main:app --host 0.0.0.0 --port $PORT