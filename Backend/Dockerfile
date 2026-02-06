# 1. Använd en stabil Python-version
FROM python:3.14.2

# 2. Sätt arbetskatalog i containern
WORKDIR /app

# 3. Installera systemberoenden som behövs för psycopg2 (databasdrivrutinen)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 4. Kopiera requirements och installera Python-bibliotek
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Kopiera resten av koden från din lokala backend-mapp till containern
COPY . .

# 6. Exponera porten som Flask körs på
EXPOSE 5000

# 7. Starta applikationen
CMD ["python", "app/main.py"]