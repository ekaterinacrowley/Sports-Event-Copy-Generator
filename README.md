# Sports Event Copy Generator

Инструмент для генерации маркетинговых текстов по предстоящим спортивным событиям. Загружает события из API [`cpservm.com`](https://cpservm.com), позволяет фильтровать по стране и виду спорта, и формирует готовые копирайты для Push, SMS, Email, Personal, Call Script, SMM-постов и статей.

---

## Структура проекта

```
src/
  app/
    App.tsx               # Главный компонент: фильтры, события, генерация текстов
    api/
      marketingApi.ts     # Клиент API cpservm.com (OAuth, события, справочники)
    components/
      ui/                 # Компоненты shadcn/ui
  styles/                 # Стили (Tailwind, шрифты, темы)
vite.config.ts            # Vite конфиг + dev-proxy на cpservm.com
vercel.json               # Конфиг деплоя на Vercel (rewrites для API)
.env.example              # Шаблон переменных окружения
```

---

## Требования

- Node.js 18+
- npm 9+
- Учётные данные партнёра `cpservm.com`: `CLIENT_ID`, `CLIENT_SECRET`, `REF`

---

## Локальный запуск

### 1. Клонируйте репозиторий

```bash
git clone <ваш-репозиторий>
cd Sports-Event-Copy-Generator
```

### 2. Создайте файл `.env`

Скопируйте шаблон и заполните реальными учётными данными:

```bash
cp .env.example .env
```

Откройте `.env` и заполните:

```env
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
REF=your_ref_here
```

> **Важно:** файл `.env` содержит секреты — никогда не коммитьте его в репозиторий. Он уже добавлен в `.gitignore`.

### 3. Установите зависимости

```bash
npm install
```

### 4. Запустите dev-сервер

```bash
npm run dev
```

Приложение откроется по адресу `http://localhost:5173`.

> Dev-сервер автоматически проксирует запросы `/api/token` и `/api/marketing/*` на `https://cpservm.com`, поэтому CORS не нужен.

---

## Сборка для продакшена

```bash
npm run build
```

Готовые файлы появятся в папке `dist/`. Можно отдавать через любой статический хостинг.

---

## Деплой на Vercel (рекомендуется)

Vercel настроен через [`vercel.json`](vercel.json): rewrites проксируют запросы к API так же, как и dev-proxy.

### Шаги:

1. Установите [Vercel CLI](https://vercel.com/docs/cli) (опционально):
   ```bash
   npm i -g vercel
   ```

2. Залогиньтесь и задеплойте:
   ```bash
   vercel
   ```

3. Добавьте переменные окружения в Vercel Dashboard:
   - Откройте `Project → Settings → Environment Variables`
   - Добавьте `CLIENT_ID`, `CLIENT_SECRET`, `REF` для окружения **Production**

   Или через CLI:
   ```bash
   vercel env add CLIENT_ID
   vercel env add CLIENT_SECRET
   vercel env add REF
   ```

4. Повторно задеплойте, чтобы применить переменные:
   ```bash
   vercel --prod
   ```

---

## Деплой на Nginx (самостоятельный сервер)

Собрать проект:

```bash
npm run build
```

Скопировать содержимое `dist/` на сервер и настроить Nginx-конфиг:

```nginx
server {
    listen 80;
    server_name ваш-домен.ru;
    root /var/www/sports-copy-generator/dist;
    index index.html;

    # SPA-роутинг
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Прокси для API авторизации
    location = /api/token {
        proxy_pass https://cpservm.com/gateway/token;
        proxy_ssl_server_name on;
        proxy_set_header Host cpservm.com;
    }

    # Прокси для маркетинг API
    location /api/marketing/ {
        proxy_pass https://cpservm.com/gateway/marketing/;
        proxy_ssl_server_name on;
        proxy_set_header Host cpservm.com;
    }
}
```

> Обратите внимание: переменные `CLIENT_ID`, `CLIENT_SECRET`, `REF` используются **во время сборки** (`npm run build`) через `import.meta.env`. Задайте их перед сборкой в `.env` или как переменные среды CI/CD.

---

## Переменные окружения

| Переменная      | Описание                                       | Где получить           |
|-----------------|------------------------------------------------|------------------------|
| `CLIENT_ID`     | OAuth Client ID партнёра                       | Менеджер cpservm.com   |
| `CLIENT_SECRET` | OAuth Client Secret партнёра                  | Менеджер cpservm.com   |
| `REF`           | Идентификатор партнёра (`ref` в API-запросах) | Менеджер cpservm.com   |

---

## Кеширование

События кешируются в `localStorage` на **12 часов** по ключу `country::sport`. При повторном выборе того же фильтра данные отображаются мгновенно, а в фоне идёт обновление.

---

## Поддерживаемые страны и языки генерации

| Страна      | Язык генерации текстов |
|-------------|------------------------|
| Азербайджан | Азербайджанский (`az`) |
| Иран        | Персидский (`fa`)      |
| Ливан       | Арабский (`ar`)        |
| Оман        | Арабский (`ar`)        |
| Палестина   | Арабский (`ar`)        |
| Сирия       | Арабский (`ar`)        |
| Турция      | Турецкий (`tr`)        |

При выборе вида спорта в фильтре стран отображаются все страны, для которых есть события в API.

---

## Как пользоваться

1. Выберите **страну** или **вид спорта** в фильтрах слева
2. Дождитесь загрузки событий
3. Нажмите **Выбрать** рядом с нужным событием
4. В правой панели выберите **шаблон** и **язык**
5. Выберите **канал** (Push, SMS, Email и др.) и скопируйте готовый текст
