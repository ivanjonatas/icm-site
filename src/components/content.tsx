import React from 'react';

import type {
  Church,
  ChurchEvent,
  NewsArticle,
  Resource,
} from '../types';

import {formatDate, isFuture} from '../data';

import {
  Link,
  Photo,
  Icon,
  External,
} from './ui';

import './ResourceCards.css';

type ResourceCover = {
  src: string;
  alt: string;
  action: string;
};

const resourceCovers: Record<string, ResourceCover> = {
  ebd: {
    src: '/images/conteudos/image(6).png',
    alt: 'Escola Bíblica Dominical.',
    action: 'Consultar os materiais',
  },

  radio: {
    src: '/images/conteudos/image(2).png',
    alt: 'Rádio Maanaim.',
    action: 'Ouvir a Rádio Maanaim',
  },

  tv: {
    src: '/images/conteudos/image(3).png',
    alt: 'TV Maanaim.',
    action: 'Acompanhar a TV Maanaim',
  },

  esf: {
    src: '/images/conteudos/logo-esf.jpg',
    alt: 'Evangelho Sem Fronteiras.',
    action: 'Conhecer o ESF Portugal',
  },

  louvor: {
    src: '/images/conteudos/image(5).png',
    alt: 'Departamento de Louvor — coletânea de partituras.',
    action: 'Explorar os conteúdos de louvor',
  },

  acessibilidade: {
    src: '/images/conteudos/image(4).png',
    alt: 'Acessibilidade ICM.',
    action: 'Conhecer os recursos',
  },
};

export function ResourceLink({
  resource,
}: {
  resource: Resource;
}) {
  const cover = resourceCovers[resource.id] ?? {
    src: '/images/conteudos/image(6).png',
    alt: 'Escola Bíblica Dominical.',
    action: 'Aceder ao conteúdo',
  };

  return (
    <a
      className="resource-card"
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="resource-card__cover">
        <img
          className="resource-card__image"
          src={cover.src}
          alt={cover.alt}
          width="1280"
          height="720"
          loading="lazy"
          decoding="async"
        />

        <span
          className="resource-card__icon"
          aria-hidden="true"
        >
          <Icon name={resource.icon} />
        </span>
      </div>

      <div className="resource-card__body">
        <small className="resource-card__category">
          {resource.category}
        </small>

        <h3 className="resource-card__title">
          {resource.title}
        </h3>

        <p className="resource-card__description">
          {resource.description}
        </p>

        <span className="resource-card__action">
          <span>{cover.action}</span>
          <Icon name="external" />
        </span>
      </div>

      <span className="sr-only">
        {' '}
        (abre num novo separador)
      </span>
    </a>
  );
}

export function NewsCard({
  article,
  featured = false,
}: {
  article: NewsArticle;
  featured?: boolean;
}) {
  return (
    <article
      className={
        'news-card ' +
        (featured ? 'news-featured' : '')
      }
    >
      <Link
        href={'/noticias/' + article.slug}
        className="news-image"
        aria-label={article.title}
      >
        <Photo
          name={article.image
            .split('/')
            .pop()!
            .replace('.webp', '')}
          alt={article.title}
        />

        <span className="image-arrow">
          <Icon name="arrow" />
        </span>
      </Link>

      <div className="news-copy">
        <div className="article-meta">
          <span>{article.category}</span>

          <time dateTime={article.date}>
            {formatDate(article.date, true)}
          </time>
        </div>

        <h3>
          <Link href={'/noticias/' + article.slug}>
            {article.title}
          </Link>
        </h3>

        <p>{article.description}</p>

        <Link
          href={'/noticias/' + article.slug}
          className="text-link"
        >
          Ler notícia
          <Icon name="arrow" />
        </Link>
      </div>
    </article>
  );
}

export function ChurchCard({
  church,
}: {
  church: Church;
}) {
  return (
    <article className="church-card">
      <div className="church-card-top">
        <span className="church-pin">
          <Icon name="pin" />
        </span>

        <small>{church.region}</small>
      </div>

      <h2>{church.name}</h2>

      <p className="church-address">
        {church.address}
      </p>

      <details>
        <summary>
          <span>
            <Icon name="clock" />
            Horários dos cultos
          </span>

          <Icon name="chevron" />
        </summary>

        <ul className="schedule">
          {church.schedule.map(item => (
            <li key={item.day}>
              <span>{item.day}</span>
              <strong>{item.time}</strong>
            </li>
          ))}
        </ul>

        <p className="small-note">
          Horas locais de Portugal continental.
          As reuniões por Zoom dependem da
          informação da congregação.
        </p>
      </details>

      <External
        href={
          'https://www.google.com/maps/search/?api=1&query=' +
          encodeURIComponent(
            church.address + ', Portugal'
          )
        }
        className="text-link"
      >
        Obter direções
      </External>
    </article>
  );
}

export function EventRow({
  event,
}: {
  event: ChurchEvent;
}) {
  const date = new Date(
    event.date + 'T12:00:00Z'
  );

  return (
    <Link
      className="event-row"
      href={'/agenda/' + event.slug}
    >
      <span className="event-date">
        <strong>{date.getUTCDate()}</strong>

        <span>
          {new Intl.DateTimeFormat('pt-PT', {
            month: 'short',
            year: 'numeric',
            timeZone: 'Europe/Lisbon',
          }).format(date)}
        </span>
      </span>

      <div>
        <small>{event.city} · Portugal</small>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
      </div>

      <span className="event-state">
        {isFuture(event.date)
          ? 'Próximo encontro'
          : 'Realizado'}
      </span>

      <Icon name="arrow" />
    </Link>
  );
}