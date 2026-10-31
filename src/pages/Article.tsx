import React from 'react';

import {
  news,
  events,
  formatDate,
  isFuture,
} from '../data';

import {
  Link,
  Eyebrow,
  Photo,
  External,
} from '../components/ui';

import {NotFound} from './NotFound';

export function Article({
  kind,
  slug,
}: {
  kind: 'news' | 'event';
  slug: string;
}) {
  const article =
    kind === 'news'
      ? news.find(
          item =>
            item.slug === slug &&
            !isFuture(item.date)
        ) ??
        events.find(
          item =>
            item.slug === slug &&
            !isFuture(item.date)
        )
      : events.find(item => item.slug === slug);

  if (!article) {
    return <NotFound />;
  }

  const upcoming =
    kind === 'event' && isFuture(article.date);

  const backHref = upcoming
    ? '/agenda'
    : '/noticias';

  const backLabel = upcoming
    ? 'Voltar à agenda'
    : 'Voltar às notícias';

  const gallery =
    'gallery' in article
      ? article.gallery || article.source
      : article.source;

  return (
    <>
      <section className="article-intro">
        <div className="container">
          <Link
            href={backHref}
            className="text-link back-link"
          >
            ← {backLabel}
          </Link>

          <Eyebrow>
            Portugal ·{' '}
            {upcoming ? 'Próximo evento' : 'Notícias'}
          </Eyebrow>

          <h1>{article.title}</h1>

          <div className="article-meta">
            <time dateTime={article.date}>
              {formatDate(article.date)}
            </time>

            <span>
              Data do acontecimento · Portugal
            </span>
          </div>
        </div>
      </section>

      <article className="article-body container">
        <figure>
          <Photo
            name={
              article.image
                .split('/')
                .pop()!
                .replace('.webp', '')
            }
            alt={article.title}
            priority
          />

          <figcaption>
            {upcoming
              ? 'Imagem de divulgação do evento.'
              : 'Registo do evento · ' +
                formatDate(article.date)}
          </figcaption>
        </figure>

        <div className="reading-width">
          <p className="lead">
            {article.description}
          </p>

          {article.paragraphs.map(
            (paragraph, index) => (
              <p key={index}>
                {paragraph}
              </p>
            )
          )}

          {gallery && (
            <External
              href={gallery}
              className="button"
            >
              {upcoming
                ? 'Consultar informações do evento'
                : 'Ver a galeria no ESF Portugal'}
            </External>
          )}

          {article.source && (
            <div className="article-source">
              <span>
                Origem da informação e da fotografia
              </span>

              <External href={article.source}>
                Evangelho Sem Fronteiras em Portugal
              </External>
            </div>
          )}
        </div>
      </article>
    </>
  );
}