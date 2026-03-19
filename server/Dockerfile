FROM python:3.13-trixie

WORKDIR /app

RUN pip install --upgrade pip

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "bridgeboard_proj.wsgi", "--bind", "0.0.0.0:8000"]