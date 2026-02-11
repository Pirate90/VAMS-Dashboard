# VAMS-Dashboard


## Node.js 설치
```
sudo apt update
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -
cat /etc/apt/sources.list.d/nodesource.list
sudo apt -y install nodejs
```

## PM2 설치
```
sudo npm install –g pm2
```

## 라이브러리 설치
```
cd ./frontend
npm install
cd ./backend
npm install
```

## 빌드
```
cd ./frontend
npm run build
```

## 실행
```
vi ./backend/.env
ROOT_PATH={절대경로}/backend

cd ./backend
pm2 start npm --name “VAMS” -- start
```