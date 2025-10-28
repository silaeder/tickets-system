# Tickets System
## Система управления заявками на мероприятия

Стек:
- NextJS
- Prisma ORM
- PostgreSQL

# Deploy
- На сервер устанавливаем nvm
- Пишем `nvm install --lts; nvm use --lts`
- Далее `npm i -g pnpm` `pnpm i`
- Заполняем .env
- `pnpx prisma db push; pnpx prisma generate`
- `pnpm run build`
- `pnpx next start --port PORT` Желательно запустить это в screen
- Готово

# Contributing:
1. Клонируем репозиторий и создаем ветку
2. Устанавливаем последнюю LTS версию node.js
3. Прописываем `npm i -g pnpm` и `pnpm i`
4. Запускаете бд и заполняете .env
5. Проект запускается командой `pnpm run dev`
6. В конце обязательно проверяем, что все собирается без ошибок командой `pnpm run build`
7. Делаем пулл реквест

# Что можно доделать:
- [ ] Dockerfile или Docker compose
- [ ] Улучшить UX страницы просмотра ответов
- [ ] Сделать установщик, т. е. автоматизировать сетап БД и сделать так, чтобы можно было выбрать название сайта, иконку, и. т. д. Авто создание аккаунта админа
- [ ] Обновить формат middleware на формат proxy
