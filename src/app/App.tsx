import { useState } from 'react';
import { Copy, Check, Calendar, Filter } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface SportsEvent {
  id: string;
  team1: string;
  team2: string;
  league: string;
  date: string;
  time: string;
  sport: string;
  country: string;
  popularity: 'top' | 'medium' | 'low';
  eventDate: Date;
  commDate: Date;
}

type Template = 'aggressive' | 'neutral' | 'vip' | 'churn';
type Language = 'ru' | 'tr' | 'ar' | 'fa' | 'fr' | 'az';

const MOCK_EVENTS: SportsEvent[] = [
  {
    id: '1',
    team1: 'Galatasaray',
    team2: 'Fenerbahce',
    league: 'Süper Lig',
    date: '2026-04-21',
    time: '19:00',
    sport: 'Футбол',
    country: 'Турция',
    popularity: 'top',
    eventDate: new Date('2026-04-21'),
    commDate: new Date('2026-04-18')
  },
  {
    id: '2',
    team1: 'Persepolis',
    team2: 'Esteghlal',
    league: 'Persian Gulf Pro League',
    date: '2026-04-21',
    time: '20:00',
    sport: 'Футбол',
    country: 'Иран',
    popularity: 'top',
    eventDate: new Date('2026-04-21'),
    commDate: new Date('2026-04-18')
  },
  {
    id: '3',
    team1: 'Anadolu Efes',
    team2: 'Fenerbahce',
    league: 'BSL',
    date: '2026-04-21',
    time: '18:30',
    sport: 'Баскетбол',
    country: 'Турция',
    popularity: 'top',
    eventDate: new Date('2026-04-21'),
    commDate: new Date('2026-04-18')
  },
  {
    id: '4',
    team1: 'Qarabag',
    team2: 'Neftchi Baku',
    league: 'Azerbaijan Premier League',
    date: '2026-04-22',
    time: '17:00',
    sport: 'Футбол',
    country: 'Азербайджан',
    popularity: 'medium',
    eventDate: new Date('2026-04-22'),
    commDate: new Date('2026-04-19')
  },
  {
    id: '5',
    team1: 'Al-Seeb',
    team2: 'Dhofar',
    league: 'Oman Professional League',
    date: '2026-04-22',
    time: '19:30',
    sport: 'Футбол',
    country: 'Оман',
    popularity: 'medium',
    eventDate: new Date('2026-04-22'),
    commDate: new Date('2026-04-19')
  },
  {
    id: '6',
    team1: 'Al-Ansar',
    team2: 'Nejmeh',
    league: 'Lebanese Premier League',
    date: '2026-04-22',
    time: '16:00',
    sport: 'Футбол',
    country: 'Ливан',
    popularity: 'medium',
    eventDate: new Date('2026-04-22'),
    commDate: new Date('2026-04-19')
  },
  {
    id: '7',
    team1: 'Shabab Al-Khalil',
    team2: 'Hilal Al-Quds',
    league: 'West Bank Premier League',
    date: '2026-04-22',
    time: '15:00',
    sport: 'Футбол',
    country: 'Палестина',
    popularity: 'low',
    eventDate: new Date('2026-04-22'),
    commDate: new Date('2026-04-19')
  },
  {
    id: '8',
    team1: 'Al-Ittihad Aleppo',
    team2: 'Al-Wathba',
    league: 'Syrian Premier League',
    date: '2026-04-23',
    time: '17:30',
    sport: 'Футбол',
    country: 'Сирия',
    popularity: 'low',
    eventDate: new Date('2026-04-23'),
    commDate: new Date('2026-04-20')
  },
  {
    id: '9',
    team1: 'Besiktas',
    team2: 'Trabzonspor',
    league: 'Turkish Ice Hockey League',
    date: '2026-04-21',
    time: '20:30',
    sport: 'Хоккей',
    country: 'Турция',
    popularity: 'medium',
    eventDate: new Date('2026-04-21'),
    commDate: new Date('2026-04-18')
  },
  {
    id: '10',
    team1: 'Khazar Lankaran',
    team2: 'Goyazan Qazax',
    league: 'Azerbaijan Ice Hockey Championship',
    date: '2026-04-22',
    time: '19:00',
    sport: 'Хоккей',
    country: 'Азербайджан',
    popularity: 'low',
    eventDate: new Date('2026-04-22'),
    commDate: new Date('2026-04-19')
  },
  {
    id: '11',
    team1: 'Mahram Tehran',
    team2: 'Petrochimi',
    league: 'Iranian Basketball Super League',
    date: '2026-04-23',
    time: '18:00',
    sport: 'Баскетбол',
    country: 'Иран',
    popularity: 'medium',
    eventDate: new Date('2026-04-23'),
    commDate: new Date('2026-04-20')
  }
];

function generateMessage(event: SportsEvent, template: Template, channel: 'push' | 'sms' | 'email' | 'personal' | 'call_script' | 'smm_post' | 'website_article', language: Language = 'ru') {
  const translations = {
    ru: {
      aggressive: {
        push: `🔥 ${event.team1} vs ${event.team2} уже сегодня!\nУспей сделать ставку до начала — коэффициенты ждут`,
        sms: `${event.team1} - ${event.team2} в ${event.time}.\nСтавь сейчас и не пропусти топ матч`,
        email: {
          subject: `Топ матч дня: ${event.team1} vs ${event.team2}`,
          body: `Сегодня в ${event.time} состоится матч ${event.team1} против ${event.team2}.\nНе упусти возможность сделать ставку.\n\nЗабирай коэффициенты прямо сейчас!`
        },
        personal: `Сегодня топовый матч ${event.team1} vs ${event.team2} в ${event.time}.\nРекомендуем обратить внимание — высокий интерес и хорошие коэффициенты.\nДелай ставку сейчас!`,
        call_script: `Добрый день! Звоню вам напомнить о топовом матче сегодня: ${event.team1} против ${event.team2} в ${event.time}.\n\nЭто один из самых ожидаемых матчей ${event.league}, высокий интерес игроков.\n\nКоэффициенты очень выгодные прямо сейчас. Рекомендую не упускать возможность.\n\nМожете сделать ставку через приложение или я помогу оформить прямо сейчас. Как вам удобнее?`,
        smm_post: `🔥 ТОП МАТЧ ДНЯ!\n\n${event.team1} ⚔️ ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\n💰 Успей поймать лучшие коэффициенты!\n⏰ Ставь до начала — после будет поздно\n\n#ставки #спорт #${event.sport.toLowerCase()} #топматч`,
        website_article: `🔥 Топ матч дня: ${event.team1} vs ${event.team2}\n\nСегодня в ${event.time} состоится один из самых ожидаемых матчей ${event.league} — встреча ${event.team1} и ${event.team2}.\n\nПочему стоит обратить внимание:\n• Высокий интерес аудитории\n• Отличные коэффициенты\n• Прямая трансляция на основных каналах\n\nНе упустите возможность сделать ставку на этот матч. Коэффициенты доступны прямо сейчас в нашем приложении.`
      },
      neutral: {
        push: `${event.team1} vs ${event.team2} сегодня в ${event.time}\nСделай ставку на матч`,
        sms: `${event.team1} - ${event.team2}, ${event.time}.\nСтавки принимаются`,
        email: {
          subject: `Матч дня: ${event.team1} vs ${event.team2}`,
          body: `Добрый день!\n\nСегодня в ${event.time} состоится матч ${event.team1} против ${event.team2} (${event.league}).\n\nВы можете сделать ставку на нашей платформе.`
        },
        personal: `${event.team1} vs ${event.team2} сегодня в ${event.time}.\nИнтересный матч, можете рассмотреть для ставки.`,
        call_script: `Здравствуйте! Напоминаю вам о матче сегодня: ${event.team1} против ${event.team2} в ${event.time}.\n\nЭто матч ${event.league}. Ставки принимаются на нашей платформе.\n\nЕсли вас интересует этот матч, вы можете сделать ставку через приложение или я могу помочь с оформлением. Подскажите, нужна ли помощь?`,
        smm_post: `⚽ Матч дня\n\n${event.team1} vs ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\nСтавки принимаются\n\n#ставки #спорт #${event.sport.toLowerCase()}`,
        website_article: `Матч дня: ${event.team1} vs ${event.team2}\n\nСегодня в ${event.time} состоится матч ${event.team1} против ${event.team2} в рамках ${event.league}.\n\nОсновная информация:\n• Время: ${event.time}\n• Лига: ${event.league}\n• Ставки доступны на платформе\n\nВы можете сделать ставку на этот матч в нашем приложении.`
      },
      vip: {
        push: `⭐ Эксклюзивно для вас: ${event.team1} vs ${event.team2}\nПерсональные коэффициенты в ${event.time}`,
        sms: `VIP: ${event.team1} - ${event.team2}, ${event.time}.\nПерсональное предложение`,
        email: {
          subject: `Персонально для вас: ${event.team1} vs ${event.team2}`,
          body: `Здравствуйте!\n\nДля вас мы подготовили персональное предложение на матч ${event.team1} против ${event.team2} (${event.time}).\n\nКак наш VIP-клиент, вы получаете эксклюзивные условия.\n\nС уважением,\nВаша команда`
        },
        personal: `Персонально для вас — топ матч дня ${event.team1} vs ${event.team2} в ${event.time}.\nПодготовили специальные условия для VIP-клиентов.`,
        call_script: `Добрый день! Это персональный звонок для наших VIP-клиентов.\n\nСегодня в ${event.time} — матч ${event.team1} против ${event.team2} (${event.league}). Специально для вас мы подготовили эксклюзивные условия и персональные коэффициенты.\n\nКак наш VIP-клиент, вы получаете приоритетный доступ к лучшим ставкам. Могу сразу оформить для вас ставку с персональными условиями. Интересно?`,
        smm_post: `⭐ VIP ПРЕДЛОЖЕНИЕ\n\n${event.team1} 🆚 ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\n💎 Эксклюзивные условия для VIP-клиентов\n🎯 Персональные коэффициенты\n\n#VIP #ставки #эксклюзив`,
        website_article: `⭐ VIP: Эксклюзивное предложение на ${event.team1} vs ${event.team2}\n\nУважаемые VIP-клиенты!\n\nСегодня в ${event.time} состоится матч ${event.team1} против ${event.team2} (${event.league}).\n\nСпециально для вас:\n• Персональные коэффициенты\n• Эксклюзивные условия\n• Приоритетный доступ к ставкам\n\nВоспользуйтесь вашим VIP-статусом и получите максимальную выгоду от этого матча.`
      },
      churn: {
        push: `Вернись к игре! ${event.team1} vs ${event.team2} в ${event.time}\nБонус на первую ставку ждёт тебя`,
        sms: `Скучали? ${event.team1} - ${event.team2} в ${event.time}.\nБонус на возвращение!`,
        email: {
          subject: `Мы скучали! ${event.team1} vs ${event.team2} + бонус`,
          body: `Привет!\n\nДавно не виделись! Сегодня отличный матч: ${event.team1} vs ${event.team2} в ${event.time}.\n\nВернись к игре — мы приготовили для тебя бонус на первую ставку.\n\nДо встречи!`
        },
        personal: `Давно не делал ставки! Сегодня ${event.team1} vs ${event.team2} в ${event.time}.\nМожем предложить бонус на возвращение.`,
        call_script: `Привет! Давно не общались, решил позвонить.\n\nСегодня отличный матч: ${event.team1} против ${event.team2} в ${event.time} (${event.league}). Заметил, что ты давно не делал ставки.\n\nУ меня для тебя хорошая новость — мы подготовили бонус на возвращение специально для тебя. Если сделаешь ставку на этот матч, получишь дополнительный бонус.\n\nХочешь вернуться? Могу помочь оформить ставку прямо сейчас.`,
        smm_post: `🎁 ВЕРНИСЬ К ИГРЕ!\n\n${event.team1} ⚡ ${event.team2}\n🕐 ${event.time}\n\n💰 Бонус на возвращение\n🎯 Специальное предложение для тебя\n\nДавно не виделись! Время вернуться 😉\n\n#возвращение #бонус #ставки`,
        website_article: `🎁 Возвращайся к игре: ${event.team1} vs ${event.team2} + бонус\n\nДавно не виделись!\n\nСегодня в ${event.time} отличный матч: ${event.team1} против ${event.team2} (${event.league}). Это отличный повод вернуться к ставкам.\n\nСпециально для тебя:\n• Бонус на первую ставку после возвращения\n• Простое оформление через приложение\n• Выгодные коэффициенты на топовый матч\n\nНе упусти момент — вернись к игре прямо сейчас!`
      }
    },
    tr: {
      aggressive: {
        push: `🔥 ${event.team1} - ${event.team2} maçı bugün!\nBaşlamadan önce bahis yap — oranlar seni bekliyor`,
        sms: `${event.team1} - ${event.team2} saat ${event.time}.\nŞimdi bahis yap ve en iyi maçı kaçırma`,
        email: {
          subject: `Günün en iyi maçı: ${event.team1} - ${event.team2}`,
          body: `Bugün saat ${event.time}'da ${event.team1} - ${event.team2} maçı oynanacak.\nBahis yapma fırsatını kaçırma.\n\nOranları hemen al!`
        },
        personal: `Bugün en iyi maç ${event.team1} - ${event.team2} saat ${event.time}.\nYüksek ilgi ve iyi oranlar var.\nŞimdi bahis yap!`,
        call_script: `Merhaba! Bugünkü en iyi maçı hatırlatmak için arıyorum: ${event.team1} - ${event.team2} saat ${event.time}.\n\n${event.league}'in en çok beklenen maçlarından biri. Yüksek oyuncu ilgisi var.\n\nOranlar şu anda çok avantajlı. Fırsatı kaçırmamanızı öneririm.\n\nUygulama üzerinden bahis yapabilirsiniz veya şimdi yardımcı olabilirim. Nasıl istersiniz?`,
        smm_post: `🔥 GÜNÜN EN İYİ MAÇI!\n\n${event.team1} ⚔️ ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\n💰 En iyi oranları yakala!\n⏰ Başlamadan bahis yap\n\n#bahis #spor #${event.sport.toLowerCase()}`,
        website_article: `🔥 Günün en iyi maçı: ${event.team1} - ${event.team2}\n\nBugün saat ${event.time}'da ${event.league}'in en çok beklenen maçlarından biri oynanacak: ${event.team1} - ${event.team2}.\n\nNeden dikkat etmelisiniz:\n• Yüksek izleyici ilgisi\n• Mükemmel oranlar\n• Canlı yayın\n\nBu maça bahis yapma fırsatını kaçırmayın. Oranlar uygulamamızda şu anda mevcut.`
      },
      neutral: {
        push: `${event.team1} - ${event.team2} bugün saat ${event.time}\nMaça bahis yap`,
        sms: `${event.team1} - ${event.team2}, ${event.time}.\nBahisler kabul ediliyor`,
        email: {
          subject: `Günün maçı: ${event.team1} - ${event.team2}`,
          body: `Merhaba!\n\nBugün saat ${event.time}'da ${event.team1} - ${event.team2} (${event.league}) maçı olacak.\n\nPlatformumuzda bahis yapabilirsiniz.`
        },
        personal: `${event.team1} - ${event.team2} bugün saat ${event.time}.\nİlginç bir maç, bahis için değerlendirebilirsiniz.`,
        call_script: `Merhaba! Bugünkü maçı hatırlatmak için arıyorum: ${event.team1} - ${event.team2} saat ${event.time}.\n\nBu ${event.league} maçı. Platformumuzda bahisler kabul ediliyor.\n\nBu maçla ilgileniyorsanız, uygulama üzerinden bahis yapabilirsiniz veya yardımcı olabilirim. Yardım gerekli mi?`,
        smm_post: `⚽ Günün Maçı\n\n${event.team1} vs ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\nBahisler kabul ediliyor\n\n#bahis #spor #${event.sport.toLowerCase()}`,
        website_article: `Günün maçı: ${event.team1} - ${event.team2}\n\nBugün saat ${event.time}'da ${event.team1} - ${event.team2} ${event.league} kapsamında karşılaşacak.\n\nTemel bilgiler:\n• Saat: ${event.time}\n• Lig: ${event.league}\n• Bahisler platformda mevcut\n\nUygulamamızdan bu maça bahis yapabilirsiniz.`
      },
      vip: {
        push: `⭐ Sizin için özel: ${event.team1} - ${event.team2}\nKişisel oranlar saat ${event.time}`,
        sms: `VIP: ${event.team1} - ${event.team2}, ${event.time}.\nKişisel teklif`,
        email: {
          subject: `Sizin için özel: ${event.team1} - ${event.team2}`,
          body: `Merhaba!\n\n${event.team1} - ${event.team2} (${event.time}) maçı için sizin için özel bir teklif hazırladık.\n\nVIP müşterimiz olarak özel koşullar elde ediyorsunuz.\n\nSaygılarımızla,\nEkibiniz`
        },
        personal: `Sizin için özel — günün en iyi maçı ${event.team1} - ${event.team2} saat ${event.time}.\nVIP müşteriler için özel koşullar hazırladık.`,
        call_script: `Merhaba! VIP müşterilerimiz için özel arama bu.\n\nBugün saat ${event.time}'da ${event.team1} - ${event.team2} (${event.league}) maçı var. Sizin için özel koşullar ve kişisel oranlar hazırladık.\n\nVIP müşterimiz olarak en iyi bahislere öncelikli erişiminiz var. Sizin için özel koşullarla bahis ayarlayabilirim. İlginizi çeker mi?`,
        smm_post: `⭐ VIP TEKLİF\n\n${event.team1} 🆚 ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\n💎 VIP müşteriler için özel koşullar\n🎯 Kişisel oranlar\n\n#VIP #bahis #özel`,
        website_article: `⭐ VIP: ${event.team1} - ${event.team2} için özel teklif\n\nDeğerli VIP müşterilerimiz!\n\nBugün saat ${event.time}'da ${event.team1} - ${event.team2} (${event.league}) karşılaşması var.\n\nSizin için özel:\n• Kişisel oranlar\n• Özel koşullar\n• Bahislere öncelikli erişim\n\nVIP statünüzü kullanın ve bu maçtan maksimum kazanç elde edin.`
      },
      churn: {
        push: `Geri dön! ${event.team1} - ${event.team2} saat ${event.time}\nİlk bahiste bonus seni bekliyor`,
        sms: `Özledik! ${event.team1} - ${event.team2} saat ${event.time}.\nDönüş bonusu!`,
        email: {
          subject: `Özledik! ${event.team1} - ${event.team2} + bonus`,
          body: `Merhaba!\n\nUzun zamandır görüşemedik! Bugün harika bir maç var: ${event.team1} - ${event.team2} saat ${event.time}.\n\nGeri dön — senin için ilk bahiste bonus hazırladık.\n\nGörüşmek üzere!`
        },
        personal: `Uzun zamandır bahis yapmıyorsun! Bugün ${event.team1} - ${event.team2} saat ${event.time}.\nDönüş bonusu teklif edebiliriz.`,
        call_script: `Merhaba! Uzun zamandır konuşmadık, arayım dedim.\n\nBugün harika bir maç var: ${event.team1} - ${event.team2} saat ${event.time} (${event.league}). Uzun süredir bahis yapmadığını fark ettim.\n\nİyi haberim var — senin için özel dönüş bonusu hazırladık. Bu maça bahis yaparsan ekstra bonus alacaksın.\n\nGeri dönmek ister misin? Şimdi bahis ayarlamana yardımcı olabilirim.`,
        smm_post: `🎁 GERİ DÖN!\n\n${event.team1} ⚡ ${event.team2}\n🕐 ${event.time}\n\n💰 Dönüş bonusu\n🎯 Senin için özel teklif\n\nÇok özledik! Geri dönme zamanı 😉\n\n#dönüş #bonus #bahis`,
        website_article: `🎁 Geri dön: ${event.team1} - ${event.team2} + bonus\n\nÇok özledik!\n\nBugün saat ${event.time}'da harika bir maç var: ${event.team1} - ${event.team2} (${event.league}). Bahislere geri dönmek için mükemmel bir fırsat.\n\nSenin için özel:\n• İlk bahiste dönüş bonusu\n• Uygulama üzerinden kolay işlem\n• En iyi maça avantajlı oranlar\n\nFırsatı kaçırma — şimdi geri dön!`
      }
    },
    ar: {
      aggressive: {
        push: `🔥 ${event.team1} ضد ${event.team2} اليوم!\nراهن قبل البداية — الاحتمالات في انتظارك`,
        sms: `${event.team1} - ${event.team2} الساعة ${event.time}.\nراهن الآن ولا تفوت المباراة الكبرى`,
        email: {
          subject: `مباراة اليوم المميزة: ${event.team1} ضد ${event.team2}`,
          body: `اليوم الساعة ${event.time} ستقام مباراة ${event.team1} ضد ${event.team2}.\nلا تفوت فرصة المراهنة.\n\nاحصل على الاحتمالات الآن!`
        },
        personal: `اليوم مباراة كبيرة ${event.team1} ضد ${event.team2} الساعة ${event.time}.\nاهتمام كبير واحتمالات جيدة.\nراهن الآن!`,
        call_script: `مرحباً! أتصل لتذكيرك بمباراة اليوم الكبرى: ${event.team1} ضد ${event.team2} الساعة ${event.time}.\n\nهذه واحدة من أكثر مباريات ${event.league} المنتظرة، اهتمام كبير من اللاعبين.\n\nالاحتمالات مفيدة جداً الآن. أوصي بعدم تفويت الفرصة.\n\nيمكنك المراهنة من خلال التطبيق أو يمكنني المساعدة في الإعداد الآن. كيف تفضل؟`,
        smm_post: `🔥 مباراة اليوم الكبرى!\n\n${event.team1} ⚔️ ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\n💰 احصل على أفضل الاحتمالات!\n⏰ راهن قبل البداية\n\n#رهان #رياضة #${event.sport}`,
        website_article: `🔥 مباراة اليوم الكبرى: ${event.team1} ضد ${event.team2}\n\nاليوم الساعة ${event.time} ستقام واحدة من أكثر مباريات ${event.league} المنتظرة — مواجهة ${event.team1} و ${event.team2}.\n\nلماذا يجب الانتباه:\n• اهتمام كبير من الجمهور\n• احتمالات ممتازة\n• بث مباشر\n\nلا تفوت فرصة المراهنة على هذه المباراة. الاحتمالات متاحة الآن في تطبيقنا.`
      },
      neutral: {
        push: `${event.team1} ضد ${event.team2} اليوم الساعة ${event.time}\nراهن على المباراة`,
        sms: `${event.team1} - ${event.team2}, ${event.time}.\nالرهانات مقبولة`,
        email: {
          subject: `مباراة اليوم: ${event.team1} ضد ${event.team2}`,
          body: `مرحباً!\n\nاليوم الساعة ${event.time} ستقام مباراة ${event.team1} ضد ${event.team2} (${event.league}).\n\nيمكنك المراهنة على منصتنا.`
        },
        personal: `${event.team1} ضد ${event.team2} اليوم الساعة ${event.time}.\nمباراة مثيرة، يمكنك المراهنة عليها.`,
        call_script: `مرحباً! أذكرك بمباراة اليوم: ${event.team1} ضد ${event.team2} الساعة ${event.time}.\n\nهذه مباراة ${event.league}. الرهانات مقبولة على منصتنا.\n\nإذا كنت مهتماً بهذه المباراة، يمكنك المراهنة من خلال التطبيق أو يمكنني المساعدة. هل تحتاج مساعدة؟`,
        smm_post: `⚽ مباراة اليوم\n\n${event.team1} vs ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\nالرهانات مقبولة\n\n#رهان #رياضة #${event.sport}`,
        website_article: `مباراة اليوم: ${event.team1} ضد ${event.team2}\n\nاليوم الساعة ${event.time} ستقام مباراة ${event.team1} ضد ${event.team2} في إطار ${event.league}.\n\nالمعلومات الأساسية:\n• الوقت: ${event.time}\n• الدوري: ${event.league}\n• الرهانات متاحة على المنصة\n\nيمكنك المراهنة على هذه المباراة في تطبيقنا.`
      },
      vip: {
        push: `⭐ خصيصاً لك: ${event.team1} ضد ${event.team2}\nاحتمالات شخصية الساعة ${event.time}`,
        sms: `VIP: ${event.team1} - ${event.team2}, ${event.time}.\nعرض شخصي`,
        email: {
          subject: `خصيصاً لك: ${event.team1} ضد ${event.team2}`,
          body: `مرحباً!\n\nأعددنا لك عرضاً شخصياً لمباراة ${event.team1} ضد ${event.team2} (${event.time}).\n\nكعميل VIP، تحصل على شروط حصرية.\n\nمع التحية،\nفريقك`
        },
        personal: `خصيصاً لك — مباراة اليوم المميزة ${event.team1} ضد ${event.team2} الساعة ${event.time}.\nأعددنا شروط خاصة لعملاء VIP.`,
        call_script: `مرحباً! هذا اتصال شخصي لعملائنا VIP.\n\nاليوم الساعة ${event.time} — مباراة ${event.team1} ضد ${event.team2} (${event.league}). خصيصاً لك أعددنا شروطاً حصرية واحتمالات شخصية.\n\nكعميل VIP، تحصل على وصول مميز لأفضل الرهانات. يمكنني إعداد رهان لك بشروط شخصية. هل تهتم؟`,
        smm_post: `⭐ عرض VIP\n\n${event.team1} 🆚 ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\n💎 شروط حصرية لعملاء VIP\n🎯 احتمالات شخصية\n\n#VIP #رهان #حصري`,
        website_article: `⭐ VIP: عرض حصري على ${event.team1} ضد ${event.team2}\n\nعملاؤنا VIP الكرام!\n\nاليوم الساعة ${event.time} ستقام مباراة ${event.team1} ضد ${event.team2} (${event.league}).\n\nخصيصاً لك:\n• احتمالات شخصية\n• شروط حصرية\n• وصول مميز للرهانات\n\nاستخدم حالة VIP الخاصة بك واحصل على أقصى فائدة من هذه المباراة.`
      },
      churn: {
        push: `عد إلى اللعبة! ${event.team1} ضد ${event.team2} الساعة ${event.time}\nمكافأة على الرهان الأول تنتظرك`,
        sms: `اشتقنا لك! ${event.team1} - ${event.team2} الساعة ${event.time}.\nمكافأة العودة!`,
        email: {
          subject: `اشتقنا لك! ${event.team1} ضد ${event.team2} + مكافأة`,
          body: `مرحباً!\n\nلم نرك منذ فترة! اليوم مباراة رائعة: ${event.team1} ضد ${event.team2} الساعة ${event.time}.\n\nعد إلى اللعبة — أعددنا لك مكافأة على الرهان الأول.\n\nإلى اللقاء!`
        },
        personal: `لم تراهن منذ فترة! اليوم ${event.team1} ضد ${event.team2} الساعة ${event.time}.\nنستطيع تقديم مكافأة العودة.`,
        call_script: `مرحباً! لم نتحدث منذ فترة، قررت الاتصال.\n\nاليوم مباراة رائعة: ${event.team1} ضد ${event.team2} الساعة ${event.time} (${event.league}). لاحظت أنك لم تراهن منذ فترة.\n\nلدي أخبار جيدة — أعددنا مكافأة عودة خصيصاً لك. إذا راهنت على هذه المباراة، ستحصل على مكافأة إضافية.\n\nهل تريد العودة؟ يمكنني المساعدة في إعداد الرهان الآن.`,
        smm_post: `🎁 عد إلى اللعبة!\n\n${event.team1} ⚡ ${event.team2}\n🕐 ${event.time}\n\n💰 مكافأة العودة\n🎯 عرض خاص لك\n\nاشتقنا لك! وقت العودة 😉\n\n#عودة #مكافأة #رهان`,
        website_article: `🎁 عد إلى اللعبة: ${event.team1} ضد ${event.team2} + مكافأة\n\nاشتقنا لك!\n\nاليوم الساعة ${event.time} مباراة رائعة: ${event.team1} ضد ${event.team2} (${event.league}). هذه فرصة مثالية للعودة للرهان.\n\nخصيصاً لك:\n• مكافأة على الرهان الأول بعد العودة\n• إعداد سهل من خلال التطبيق\n• احتمالات مفيدة على مباراة كبرى\n\nلا تفوت اللحظة — عد الآن!`
      }
    },
    fa: {
      aggressive: {
        push: `🔥 ${event.team1} در مقابل ${event.team2} امروز!\nقبل از شروع شرط بندی کن — ضرایب منتظرند`,
        sms: `${event.team1} - ${event.team2} ساعت ${event.time}.\nهمین حالا شرط بندی کن و مسابقه برتر را از دست نده`,
        email: {
          subject: `مسابقه برتر روز: ${event.team1} در مقابل ${event.team2}`,
          body: `امروز ساعت ${event.time} مسابقه ${event.team1} در مقابل ${event.team2} برگزار می‌شود.\nفرصت شرط بندی را از دست نده.\n\nهمین الان ضرایب را دریافت کن!`
        },
        personal: `امروز مسابقه برتر ${event.team1} در مقابل ${event.team2} ساعت ${event.time}.\nعلاقه زیاد و ضرایب خوب.\nهمین الان شرط بندی کن!`,
        call_script: `سلام! برای یادآوری مسابقه برتر امروز زنگ می‌زنم: ${event.team1} در مقابل ${event.team2} ساعت ${event.time}.\n\nیکی از منتظرترین مسابقات ${event.league}، علاقه بالای بازیکنان.\n\nضرایب الان خیلی سودمند هستند. توصیه می‌کنم فرصت را از دست ندهید.\n\nمی‌توانید از طریق اپلیکیشن شرط بندی کنید یا می‌توانم الان کمک کنم. کدام راحت‌تره؟`,
        smm_post: `🔥 مسابقه برتر روز!\n\n${event.team1} ⚔️ ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\n💰 بهترین ضرایب را بگیر!\n⏰ قبل از شروع شرط ببند\n\n#شرط_بندی #ورزش`,
        website_article: `🔥 مسابقه برتر روز: ${event.team1} در مقابل ${event.team2}\n\nامروز ساعت ${event.time} یکی از منتظرترین مسابقات ${event.league} برگزار می‌شود — دیدار ${event.team1} و ${event.team2}.\n\nچرا باید توجه کنید:\n• علاقه بالای مخاطبان\n• ضرایب عالی\n• پخش زنده\n\nفرصت شرط بندی روی این مسابقه را از دست ندهید. ضرایب الان در اپلیکیشن ما موجود است.`
      },
      neutral: {
        push: `${event.team1} در مقابل ${event.team2} امروز ساعت ${event.time}\nروی مسابقه شرط بندی کن`,
        sms: `${event.team1} - ${event.team2}, ${event.time}.\nشرط بندی‌ها پذیرفته می‌شوند`,
        email: {
          subject: `مسابقه روز: ${event.team1} در مقابل ${event.team2}`,
          body: `سلام!\n\nامروز ساعت ${event.time} مسابقه ${event.team1} در مقابل ${event.team2} (${event.league}) برگزار خواهد شد.\n\nمی‌توانید در پلتفرم ما شرط بندی کنید.`
        },
        personal: `${event.team1} در مقابل ${event.team2} امروز ساعت ${event.time}.\nمسابقه جالب، می‌توانید برای شرط بندی در نظر بگیرید.`,
        call_script: `سلام! مسابقه امروز را یادآوری می‌کنم: ${event.team1} در مقابل ${event.team2} ساعت ${event.time}.\n\nاین مسابقه ${event.league} است. شرط بندی‌ها در پلتفرم ما پذیرفته می‌شود.\n\nاگر به این مسابقه علاقه‌مندید، می‌توانید از طریق اپلیکیشن شرط ببندید یا می‌توانم کمک کنم. نیاز به کمک دارید؟`,
        smm_post: `⚽ مسابقه روز\n\n${event.team1} vs ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\nشرط بندی‌ها پذیرفته می‌شود\n\n#شرط_بندی #ورزش`,
        website_article: `مسابقه روز: ${event.team1} در مقابل ${event.team2}\n\nامروز ساعت ${event.time} مسابقه ${event.team1} در مقابل ${event.team2} در چارچوب ${event.league} برگزار می‌شود.\n\nاطلاعات اصلی:\n• زمان: ${event.time}\n• لیگ: ${event.league}\n• شرط بندی‌ها در پلتفرم موجود است\n\nمی‌توانید در اپلیکیشن ما روی این مسابقه شرط ببندید.`
      },
      vip: {
        push: `⭐ ویژه برای شما: ${event.team1} در مقابل ${event.team2}\nضرایب شخصی ساعت ${event.time}`,
        sms: `VIP: ${event.team1} - ${event.team2}, ${event.time}.\nپیشنهاد شخصی`,
        email: {
          subject: `ویژه برای شما: ${event.team1} در مقابل ${event.team2}`,
          body: `سلام!\n\nبرای مسابقه ${event.team1} در مقابل ${event.team2} (${event.time}) پیشنهاد ویژه‌ای برای شما آماده کرده‌ایم.\n\nبه عنوان مشتری VIP، شرایط انحصاری دریافت می‌کنید.\n\nبا احترام،\nتیم شما`
        },
        personal: `ویژه برای شما — مسابقه برتر روز ${event.team1} در مقابل ${event.team2} ساعت ${event.time}.\nشرایط ویژه برای مشتریان VIP آماده کرده‌ایم.`,
        call_script: `سلام! این تماس شخصی برای مشتریان VIP ماست.\n\nامروز ساعت ${event.time} — مسابقه ${event.team1} در مقابل ${event.team2} (${event.league}). ویژه برای شما شرایط انحصاری و ضرایب شخصی آماده کردیم.\n\nبه عنوان مشتری VIP، دسترسی اولویت‌دار به بهترین شرط‌ها را دارید. می‌توانم برای شما با شرایط شخصی شرط آماده کنم. جالبه؟`,
        smm_post: `⭐ پیشنهاد VIP\n\n${event.team1} 🆚 ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\n💎 شرایط انحصاری برای مشتریان VIP\n🎯 ضرایب شخصی\n\n#VIP #شرط_بندی`,
        website_article: `⭐ VIP: پیشنهاد انحصاری برای ${event.team1} در مقابل ${event.team2}\n\nمشتریان VIP عزیز!\n\nامروز ساعت ${event.time} مسابقه ${event.team1} در مقابل ${event.team2} (${event.league}) برگزار می‌شود.\n\nویژه برای شما:\n• ضرایب شخصی\n• شرایط انحصاری\n• دسترسی اولویت‌دار به شرط‌ها\n\nاز وضعیت VIP خود استفاده کنید و بیشترین سود را از این مسابقه ببرید.`
      },
      churn: {
        push: `برگرد به بازی! ${event.team1} در مقابل ${event.team2} ساعت ${event.time}\nجایزه اولین شرط بندی منتظر تو است`,
        sms: `دلمان برات تنگ شده! ${event.team1} - ${event.team2} ساعت ${event.time}.\nجایزه بازگشت!`,
        email: {
          subject: `دلمان برات تنگ شده! ${event.team1} در مقابل ${event.team2} + جایزه`,
          body: `سلام!\n\nمدت زیادی است که همدیگر را ندیده‌ایم! امروز مسابقه عالی: ${event.team1} در مقابل ${event.team2} ساعت ${event.time}.\n\nبرگرد به بازی — جایزه اولین شرط بندی را برای تو آماده کرده‌ایم.\n\nتا دیدار!`
        },
        personal: `مدتی است شرط بندی نکرده‌ای! امروز ${event.team1} در مقابل ${event.team2} ساعت ${event.time}.\nمی‌توانیم جایزه بازگشت پیشنهاد کنیم.`,
        call_script: `سلام! مدتی است که حرف نزدیم، تصمیم گرفتم زنگ بزنم.\n\nامروز مسابقه عالی: ${event.team1} در مقابل ${event.team2} ساعت ${event.time} (${event.league}). متوجه شدم مدتی شرط نبستی.\n\nخبر خوبی دارم — جایزه بازگشت ویژه برای تو آماده کردیم. اگر روی این مسابقه شرط ببندی، جایزه اضافی می‌گیری.\n\nمی‌خوای برگردی؟ می‌توانم الان کمک کنم شرط آماده کنیم.`,
        smm_post: `🎁 برگرد به بازی!\n\n${event.team1} ⚡ ${event.team2}\n🕐 ${event.time}\n\n💰 جایزه بازگشت\n🎯 پیشنهاد ویژه برای تو\n\nدلمون برات تنگ شده! وقت برگشتنه 😉\n\n#بازگشت #جایزه`,
        website_article: `🎁 برگرد به بازی: ${event.team1} در مقابل ${event.team2} + جایزه\n\nدلمون برات تنگ شده!\n\nامروز ساعت ${event.time} مسابقه عالی: ${event.team1} در مقابل ${event.team2} (${event.league}). فرصت عالی برای برگشتن به شرط بندی.\n\nویژه برای تو:\n• جایزه اولین شرط بعد از بازگشت\n• آماده‌سازی آسان از طریق اپلیکیشن\n• ضرایب سودمند روی مسابقه برتر\n\nلحظه رو از دست نده — الان برگرد!`
      }
    },
    fr: {
      aggressive: {
        push: `🔥 ${event.team1} vs ${event.team2} aujourd'hui !\nParie avant le début — les cotes t'attendent`,
        sms: `${event.team1} - ${event.team2} à ${event.time}.\nParie maintenant et ne rate pas le top match`,
        email: {
          subject: `Top match du jour : ${event.team1} vs ${event.team2}`,
          body: `Aujourd'hui à ${event.time} aura lieu le match ${event.team1} contre ${event.team2}.\nNe rate pas l'opportunité de parier.\n\nPrends les cotes maintenant !`
        },
        personal: `Aujourd'hui top match ${event.team1} vs ${event.team2} à ${event.time}.\nGrand intérêt et bonnes cotes.\nParie maintenant !`,
        call_script: `Bonjour ! J'appelle pour te rappeler le top match d'aujourd'hui : ${event.team1} contre ${event.team2} à ${event.time}.\n\nC'est l'un des matchs les plus attendus de ${event.league}, grand intérêt des joueurs.\n\nLes cotes sont très avantageuses maintenant. Je recommande de ne pas manquer l'opportunité.\n\nTu peux parier via l'application ou je peux t'aider maintenant. Comment préfères-tu ?`,
        smm_post: `🔥 TOP MATCH DU JOUR !\n\n${event.team1} ⚔️ ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\n💰 Attrape les meilleures cotes !\n⏰ Parie avant le début\n\n#paris #sport`,
        website_article: `🔥 Top match du jour : ${event.team1} vs ${event.team2}\n\nAujourd'hui à ${event.time} aura lieu l'un des matchs les plus attendus de ${event.league} — la rencontre entre ${event.team1} et ${event.team2}.\n\nPourquoi y prêter attention :\n• Grand intérêt du public\n• Excellentes cotes\n• Diffusion en direct\n\nNe rate pas l'opportunité de parier sur ce match. Les cotes sont disponibles maintenant dans notre application.`
      },
      neutral: {
        push: `${event.team1} vs ${event.team2} aujourd'hui à ${event.time}\nParie sur le match`,
        sms: `${event.team1} - ${event.team2}, ${event.time}.\nLes paris sont acceptés`,
        email: {
          subject: `Match du jour : ${event.team1} vs ${event.team2}`,
          body: `Bonjour !\n\nAujourd'hui à ${event.time} aura lieu le match ${event.team1} contre ${event.team2} (${event.league}).\n\nVous pouvez parier sur notre plateforme.`
        },
        personal: `${event.team1} vs ${event.team2} aujourd'hui à ${event.time}.\nMatch intéressant, vous pouvez envisager de parier.`,
        call_script: `Bonjour ! Je te rappelle le match d'aujourd'hui : ${event.team1} contre ${event.team2} à ${event.time}.\n\nC'est un match de ${event.league}. Les paris sont acceptés sur notre plateforme.\n\nSi ce match t'intéresse, tu peux parier via l'application ou je peux t'aider. Besoin d'aide ?`,
        smm_post: `⚽ Match du jour\n\n${event.team1} vs ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\nLes paris sont acceptés\n\n#paris #sport`,
        website_article: `Match du jour : ${event.team1} vs ${event.team2}\n\nAujourd'hui à ${event.time} aura lieu le match ${event.team1} contre ${event.team2} dans le cadre de ${event.league}.\n\nInformations principales :\n• Heure : ${event.time}\n• Ligue : ${event.league}\n• Paris disponibles sur la plateforme\n\nTu peux parier sur ce match dans notre application.`
      },
      vip: {
        push: `⭐ Exclusivement pour vous : ${event.team1} vs ${event.team2}\nCotes personnelles à ${event.time}`,
        sms: `VIP : ${event.team1} - ${event.team2}, ${event.time}.\nOffre personnelle`,
        email: {
          subject: `Personnellement pour vous : ${event.team1} vs ${event.team2}`,
          body: `Bonjour !\n\nNous avons préparé une offre personnelle pour le match ${event.team1} contre ${event.team2} (${event.time}).\n\nEn tant que client VIP, vous obtenez des conditions exclusives.\n\nCordialement,\nVotre équipe`
        },
        personal: `Personnellement pour vous — top match du jour ${event.team1} vs ${event.team2} à ${event.time}.\nConditions spéciales préparées pour les clients VIP.`,
        call_script: `Bonjour ! C'est un appel personnel pour nos clients VIP.\n\nAujourd'hui à ${event.time} — match ${event.team1} contre ${event.team2} (${event.league}). Spécialement pour toi, nous avons préparé des conditions exclusives et des cotes personnelles.\n\nEn tant que client VIP, tu as un accès prioritaire aux meilleurs paris. Je peux préparer un pari avec des conditions personnelles. Intéressé ?`,
        smm_post: `⭐ OFFRE VIP\n\n${event.team1} 🆚 ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\n💎 Conditions exclusives pour clients VIP\n🎯 Cotes personnelles\n\n#VIP #paris`,
        website_article: `⭐ VIP : Offre exclusive sur ${event.team1} vs ${event.team2}\n\nChers clients VIP !\n\nAujourd'hui à ${event.time} aura lieu le match ${event.team1} contre ${event.team2} (${event.league}).\n\nSpécialement pour vous :\n• Cotes personnelles\n• Conditions exclusives\n• Accès prioritaire aux paris\n\nUtilise ton statut VIP et obtiens le maximum de ce match.`
      },
      churn: {
        push: `Reviens au jeu ! ${event.team1} vs ${event.team2} à ${event.time}\nBonus sur le premier pari t'attend`,
        sms: `Tu nous manques ! ${event.team1} - ${event.team2} à ${event.time}.\nBonus de retour !`,
        email: {
          subject: `Tu nous manques ! ${event.team1} vs ${event.team2} + bonus`,
          body: `Salut !\n\nÇa fait longtemps ! Aujourd'hui excellent match : ${event.team1} vs ${event.team2} à ${event.time}.\n\nReviens au jeu — nous avons préparé un bonus sur le premier pari pour toi.\n\nÀ bientôt !`
        },
        personal: `Ça fait longtemps que tu n'as pas parié ! Aujourd'hui ${event.team1} vs ${event.team2} à ${event.time}.\nNous pouvons offrir un bonus de retour.`,
        call_script: `Salut ! Ça fait longtemps qu'on ne s'est pas parlé, j'ai décidé d'appeler.\n\nAujourd'hui excellent match : ${event.team1} contre ${event.team2} à ${event.time} (${event.league}). J'ai remarqué que tu n'as pas parié depuis longtemps.\n\nJ'ai une bonne nouvelle — nous avons préparé un bonus de retour spécialement pour toi. Si tu paries sur ce match, tu recevras un bonus supplémentaire.\n\nTu veux revenir ? Je peux t'aider à préparer le pari maintenant.`,
        smm_post: `🎁 REVIENS AU JEU !\n\n${event.team1} ⚡ ${event.team2}\n🕐 ${event.time}\n\n💰 Bonus de retour\n🎯 Offre spéciale pour toi\n\nTu nous manques ! C'est l'heure de revenir 😉\n\n#retour #bonus`,
        website_article: `🎁 Reviens au jeu : ${event.team1} vs ${event.team2} + bonus\n\nTu nous manques !\n\nAujourd'hui à ${event.time} excellent match : ${event.team1} contre ${event.team2} (${event.league}). C'est une excellente occasion de revenir aux paris.\n\nSpécialement pour toi :\n• Bonus sur le premier pari après le retour\n• Préparation facile via l'application\n• Cotes avantageuses sur un top match\n\nNe rate pas le moment — reviens maintenant !`
      }
    },
    az: {
      aggressive: {
        push: `🔥 ${event.team1} - ${event.team2} oyunu bu gün!\nBaşlamazdan əvvəl mərc et — əmsallar səni gözləyir`,
        sms: `${event.team1} - ${event.team2} saat ${event.time}.\nİndi mərc et və top oyunu qaçırma`,
        email: {
          subject: `Günün top oyunu: ${event.team1} - ${event.team2}`,
          body: `Bu gün saat ${event.time}-da ${event.team1} - ${event.team2} oyunu keçiriləcək.\nMərc etmək fürsətini qaçırma.\n\nƏmsalları indi al!`
        },
        personal: `Bu gün top oyun ${event.team1} - ${event.team2} saat ${event.time}.\nYüksək maraq və yaxşı əmsallar.\nİndi mərc et!`,
        call_script: `Salam! Bugünkü top oyunu xatırlatmaq üçün zəng edirəm: ${event.team1} - ${event.team2} saat ${event.time}.\n\n${event.league}'in ən gözlənilən oyunlarından biri, yüksək oyunçu marağı.\n\nƏmsallar indi çox sərfəlidir. Fürsəti qaçırmamanızı tövsiyə edirəm.\n\nTətbiq vasitəsilə mərc edə bilərsiniz və ya indi kömək edə bilərəm. Necə istəyirsiniz?`,
        smm_post: `🔥 GÜNÜN TOP OYUNU!\n\n${event.team1} ⚔️ ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\n💰 Ən yaxşı əmsalları tut!\n⏰ Başlamazdan mərc et\n\n#mərc #idman`,
        website_article: `🔥 Günün top oyunu: ${event.team1} - ${event.team2}\n\nBu gün saat ${event.time}-da ${event.league}'in ən gözlənilən oyunlarından biri keçiriləcək — ${event.team1} və ${event.team2} qarşılaşması.\n\nNiyə diqqət etməlisiniz:\n• Yüksək tamaşaçı marağı\n• Əla əmsallar\n• Canlı yayım\n\nBu oyuna mərc etmək fürsətini qaçırmayın. Əmsallar tətbiqdə indi mövcuddur.`
      },
      neutral: {
        push: `${event.team1} - ${event.team2} bu gün saat ${event.time}\nOyuna mərc et`,
        sms: `${event.team1} - ${event.team2}, ${event.time}.\nMərclər qəbul edilir`,
        email: {
          subject: `Günün oyunu: ${event.team1} - ${event.team2}`,
          body: `Salam!\n\nBu gün saat ${event.time}-da ${event.team1} - ${event.team2} (${event.league}) oyunu olacaq.\n\nPlatformamızda mərc edə bilərsiniz.`
        },
        personal: `${event.team1} - ${event.team2} bu gün saat ${event.time}.\nMaraqlı oyun, mərc üçün nəzərdən keçirə bilərsiniz.`,
        call_script: `Salam! Bugünkü oyunu xatırlatmaq üçün zəng edirəm: ${event.team1} - ${event.team2} saat ${event.time}.\n\nBu ${event.league} oyunudur. Platformamızda mərclər qəbul edilir.\n\nBu oyunla maraqlanırsınızsa, tətbiq vasitəsilə mərc edə bilərsiniz və ya kömək edə bilərəm. Kömək lazımdır?`,
        smm_post: `⚽ Günün Oyunu\n\n${event.team1} vs ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\nMərclər qəbul edilir\n\n#mərc #idman`,
        website_article: `Günün oyunu: ${event.team1} - ${event.team2}\n\nBu gün saat ${event.time}-da ${event.team1} - ${event.team2} ${event.league} çərçivəsində qarşılaşacaq.\n\nƏsas məlumatlar:\n• Vaxt: ${event.time}\n• Liqa: ${event.league}\n• Mərclər platformada mövcuddur\n\nTətbiqdən bu oyuna mərc edə bilərsiniz.`
      },
      vip: {
        push: `⭐ Sizin üçün xüsusi: ${event.team1} - ${event.team2}\nFərdi əmsallar saat ${event.time}`,
        sms: `VIP: ${event.team1} - ${event.team2}, ${event.time}.\nFərdi təklif`,
        email: {
          subject: `Sizin üçün xüsusi: ${event.team1} - ${event.team2}`,
          body: `Salam!\n\n${event.team1} - ${event.team2} (${event.time}) oyunu üçün sizin üçün xüsusi təklif hazırladıq.\n\nVIP müştərimiz kimi eksklüziv şərtlər əldə edirsiniz.\n\nHörmətlə,\nKomandanız`
        },
        personal: `Sizin üçün xüsusi — günün top oyunu ${event.team1} - ${event.team2} saat ${event.time}.\nVIP müştərilər üçün xüsusi şərtlər hazırladıq.`,
        call_script: `Salam! Bu VIP müştərilərimiz üçün şəxsi zəngdir.\n\nBu gün saat ${event.time}-da — ${event.team1} - ${event.team2} oyunu (${event.league}). Sizin üçün xüsusi eksklüziv şərtlər və fərdi əmsallar hazırladıq.\n\nVIP müştərimiz kimi ən yaxşı mərclərə prioritet girişiniz var. Sizin üçün fərdi şərtlərlə mərc hazırlaya bilərəm. Maraqlandırır?`,
        smm_post: `⭐ VIP TƏKLİF\n\n${event.team1} 🆚 ${event.team2}\n🕐 ${event.time}\n🏆 ${event.league}\n\n💎 VIP müştərilər üçün eksklüziv şərtlər\n🎯 Fərdi əmsallar\n\n#VIP #mərc`,
        website_article: `⭐ VIP: ${event.team1} - ${event.team2} üçün eksklüziv təklif\n\nHörmətli VIP müştərilərimiz!\n\nBu gün saat ${event.time}-da ${event.team1} - ${event.team2} (${event.league}) qarşılaşması olacaq.\n\nSizin üçün xüsusi:\n• Fərdi əmsallar\n• Eksklüziv şərtlər\n• Mərclərə prioritet giriş\n\nVIP statusunuzdan istifadə edin və bu oyundan maksimum fayda əldə edin.`
      },
      churn: {
        push: `Oyuna qayıt! ${event.team1} - ${event.team2} saat ${event.time}\nİlk mərcdə bonus səni gözləyir`,
        sms: `Darıxdıq! ${event.team1} - ${event.team2} saat ${event.time}.\nQayıdış bonusu!`,
        email: {
          subject: `Darıxdıq! ${event.team1} - ${event.team2} + bonus`,
          body: `Salam!\n\nÇoxdan görüşməmişik! Bu gün əla oyun var: ${event.team1} - ${event.team2} saat ${event.time}.\n\nOyuna qayıt — sənin üçün ilk mərcdə bonus hazırladıq.\n\nGörüşənədək!`
        },
        personal: `Çoxdur mərc etmirsən! Bu gün ${event.team1} - ${event.team2} saat ${event.time}.\nQayıdış bonusu təklif edə bilərik.`,
        call_script: `Salam! Çoxdur danışmamışıq, zəng etməyə qərar verdim.\n\nBu gün əla oyun var: ${event.team1} - ${event.team2} saat ${event.time} (${event.league}). Çoxdur mərc etmədiyinizi gördüm.\n\nYaxşı xəbərim var — sizin üçün xüsusi qayıdış bonusu hazırladıq. Bu oyuna mərc etsəniz, əlavə bonus alacaqsınız.\n\nQayıtmaq istəyirsiniz? İndi mərc hazırlamağa kömək edə bilərəm.`,
        smm_post: `🎁 OYUNA QAYIT!\n\n${event.team1} ⚡ ${event.team2}\n🕐 ${event.time}\n\n💰 Qayıdış bonusu\n🎯 Sizin üçün xüsusi təklif\n\nDarıxdıq! Qayıtma vaxtı 😉\n\n#qayıdış #bonus`,
        website_article: `🎁 Qayıt: ${event.team1} - ${event.team2} + bonus\n\nDarıxdıq!\n\nBu gün saat ${event.time}-da əla oyun: ${event.team1} - ${event.team2} (${event.league}). Mərclərə qayıtmaq üçün əla fürsət.\n\nSizin üçün xüsusi:\n• Qayıdışdan sonra ilk mərcdə bonus\n• Tətbiq vasitəsilə asan hazırlama\n• Top oyuna sərfəli əmsallar\n\nFürsəti qaçırmayın — indi qayıdın!`
      }
    }
  };

  return translations[language][template][channel];
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Скопировано!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Ошибка копирования');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {label || 'Copy'}
    </button>
  );
}

export default function App() {
  const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('aggressive');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ru');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [eventDateFilter, setEventDateFilter] = useState<string>('');
  const [commDateFilter, setCommDateFilter] = useState<string>('');

  const filteredEvents = MOCK_EVENTS.filter(event => {
    if (sportFilter !== 'all' && event.sport !== sportFilter) return false;
    if (countryFilter !== 'all' && event.country !== countryFilter) return false;
    if (dateFilter === 'today' && event.date !== '2026-04-21') return false;
    if (dateFilter === 'tomorrow' && event.date !== '2026-04-22') return false;
    if (eventDateFilter && event.eventDate.toISOString().split('T')[0] !== eventDateFilter) return false;
    if (commDateFilter && event.commDate.toISOString().split('T')[0] !== commDateFilter) return false;
    return true;
  });

  const handleCopyEventName = async (event: SportsEvent) => {
    try {
      await navigator.clipboard.writeText(`${event.team1} vs ${event.team2}`);
      toast.success('Название скопировано!');
    } catch (err) {
      toast.error('Ошибка копирования');
    }
  };

  return (
    <>
      <Toaster position="top-right" theme="dark" />
      <div className="size-full bg-zinc-900 text-white flex">
      {/* Events List */}
      <div className="w-[400px] border-r border-zinc-800 flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-zinc-400" />
            <h2 className="font-semibold">Фильтры</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Страна</label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">Все страны</option>
                <option value="Турция">Турция</option>
                <option value="Азербайджан">Азербайджан</option>
                <option value="Иран">Иран</option>
                <option value="Оман">Оман</option>
                <option value="Ливан">Ливан</option>
                <option value="Палестина">Палестина</option>
                <option value="Сирия">Сирия</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Спорт</label>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">Все виды спорта</option>
                <option value="Футбол">Футбол</option>
                <option value="Баскетбол">Баскетбол</option>
                <option value="Хоккей">Хоккей</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Дата события</label>
              <input
                type="date"
                value={eventDateFilter}
                onChange={(e) => setEventDateFilter(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Дата коммуникации</label>
              <input
                type="date"
                value={commDateFilter}
                onChange={(e) => setCommDateFilter(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Быстрый выбор</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">Все даты</option>
                <option value="today">Сегодня</option>
                <option value="tomorrow">Завтра</option>
              </select>
            </div>

            <button
              onClick={() => {
                setCountryFilter('all');
                setSportFilter('all');
                setDateFilter('all');
                setEventDateFilter('');
                setCommDateFilter('');
              }}
              className="w-full px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>

        {/* Events */}
        <div className="flex-1 overflow-y-auto">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`p-4 border-b border-zinc-800 cursor-pointer transition-colors ${
                selectedEvent?.id === event.id ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{event.team1} vs {event.team2}</h3>
                  <div className="text-sm text-zinc-400 space-y-1">
                    <div>{event.league}</div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">{event.country}</span>
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">{event.sport}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {event.date} • {event.time}
                    </div>
                    <div className="text-xs space-y-0.5 pt-1 border-t border-zinc-700">
                      <div>📅 Событие: {event.eventDate.toLocaleDateString('ru-RU')}</div>
                      <div>📞 Коммуникация: {event.commDate.toLocaleDateString('ru-RU')}</div>
                    </div>
                  </div>
                </div>
                {event.popularity === 'top' && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">TOP</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Выбрать
                </button>
                <button
                  onClick={() => handleCopyEventName(event)}
                  className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Generator Panel */}
      <div className="flex-1 flex flex-col">
        {selectedEvent ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
              <h1 className="text-2xl font-semibold mb-2">
                {selectedEvent.team1} vs {selectedEvent.team2}
              </h1>
              <div className="text-zinc-400 space-y-2">
                <div>{selectedEvent.league} • {selectedEvent.date} • {selectedEvent.time}</div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded">{selectedEvent.country}</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded">{selectedEvent.sport}</span>
                </div>
                <div className="flex items-center gap-4 text-sm pt-2 border-t border-zinc-700">
                  <div>📅 <span className="text-zinc-500">Событие:</span> {selectedEvent.eventDate.toLocaleDateString('ru-RU')}</div>
                  <div>📞 <span className="text-zinc-500">Коммуникация:</span> {selectedEvent.commDate.toLocaleDateString('ru-RU')}</div>
                </div>
              </div>
            </div>

            {/* Template & Language Selector */}
            <div className="p-6 border-b border-zinc-800 space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Шаблон</label>
                <div className="flex gap-2">
                  {(['aggressive', 'neutral', 'vip', 'churn'] as Template[]).map((template) => (
                    <button
                      key={template}
                      onClick={() => setSelectedTemplate(template)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedTemplate === template
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {template === 'aggressive' && 'Aggressive'}
                      {template === 'neutral' && 'Neutral'}
                      {template === 'vip' && 'VIP'}
                      {template === 'churn' && 'Churn'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Язык</label>
                <div className="flex gap-2 flex-wrap">
                  {([
                    { code: 'ru', name: 'Русский' },
                    { code: 'tr', name: 'Türkçe' },
                    { code: 'ar', name: 'العربية' },
                    { code: 'fa', name: 'فارسی' },
                    { code: 'fr', name: 'Français' },
                    { code: 'az', name: 'Azərbaycan' }
                  ] as Array<{ code: Language; name: string }>).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedLanguage === lang.code
                          ? 'bg-green-600 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Push */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">📱 Push</h3>
                  <CopyButton text={generateMessage(selectedEvent, selectedTemplate, 'push', selectedLanguage) as string} />
                </div>
                <div className="text-sm text-zinc-300 whitespace-pre-line bg-zinc-900 rounded p-3">
                  {generateMessage(selectedEvent, selectedTemplate, 'push', selectedLanguage)}
                </div>
              </div>

              {/* SMS */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">💬 SMS</h3>
                  <CopyButton text={generateMessage(selectedEvent, selectedTemplate, 'sms', selectedLanguage) as string} />
                </div>
                <div className="text-sm text-zinc-300 whitespace-pre-line bg-zinc-900 rounded p-3">
                  {generateMessage(selectedEvent, selectedTemplate, 'sms', selectedLanguage)}
                </div>
              </div>

              {/* Email */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">📧 Email</h3>
                  <CopyButton
                    text={`Subject: ${(generateMessage(selectedEvent, selectedTemplate, 'email', selectedLanguage) as any).subject}\n\n${(generateMessage(selectedEvent, selectedTemplate, 'email', selectedLanguage) as any).body}`}
                  />
                </div>
                <div className="text-sm text-zinc-300 space-y-3">
                  <div className="bg-zinc-900 rounded p-3">
                    <div className="text-zinc-500 text-xs mb-1">Тема:</div>
                    <div>{(generateMessage(selectedEvent, selectedTemplate, 'email', selectedLanguage) as any).subject}</div>
                  </div>
                  <div className="bg-zinc-900 rounded p-3 whitespace-pre-line">
                    <div className="text-zinc-500 text-xs mb-1">Текст:</div>
                    <div>{(generateMessage(selectedEvent, selectedTemplate, 'email', selectedLanguage) as any).body}</div>
                  </div>
                </div>
              </div>

              {/* Personal Message */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">🎯 Personal Message</h3>
                  <CopyButton text={generateMessage(selectedEvent, selectedTemplate, 'personal', selectedLanguage) as string} />
                </div>
                <div className="text-sm text-zinc-300 whitespace-pre-line bg-zinc-900 rounded p-3">
                  {generateMessage(selectedEvent, selectedTemplate, 'personal', selectedLanguage)}
                </div>
              </div>

              {/* Call Script */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">📞 Скрипт для звонка</h3>
                  <CopyButton text={generateMessage(selectedEvent, selectedTemplate, 'call_script', selectedLanguage) as string} />
                </div>
                <div className="text-sm text-zinc-300 whitespace-pre-line bg-zinc-900 rounded p-3">
                  {generateMessage(selectedEvent, selectedTemplate, 'call_script', selectedLanguage)}
                </div>
              </div>

              {/* SMM Post */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">📱 Пост SMM</h3>
                  <CopyButton text={generateMessage(selectedEvent, selectedTemplate, 'smm_post', selectedLanguage) as string} />
                </div>
                <div className="text-sm text-zinc-300 whitespace-pre-line bg-zinc-900 rounded p-3">
                  {generateMessage(selectedEvent, selectedTemplate, 'smm_post', selectedLanguage)}
                </div>
              </div>

              {/* Website Article */}
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">📝 Мини статья для сайта</h3>
                  <CopyButton text={generateMessage(selectedEvent, selectedTemplate, 'website_article', selectedLanguage) as string} />
                </div>
                <div className="text-sm text-zinc-300 whitespace-pre-line bg-zinc-900 rounded p-3">
                  {generateMessage(selectedEvent, selectedTemplate, 'website_article', selectedLanguage)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <div className="text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
              <p>Выберите событие из списка</p>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}