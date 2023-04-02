FROM python:3

# Install docker
WORKDIR /docker
RUN curl -fsSL https://get.docker.com -o get-docker.sh
RUN sh ./get-docker.sh 

WORKDIR /cli

COPY . .

RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /app

CMD [ "python3", "/cli/init.py" ]
