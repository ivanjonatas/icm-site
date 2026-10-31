import React, {useState} from 'react';

import {
  news,
  events,
  normalise,
  isFuture,
} from '../data';

import type {NewsArticle} from '../types';

import {
  PageIntro,
  Icon,
  Empty,
  External,
} from '../components/ui';

import {NewsCard} from '../components/content';

export function News() {
  const [q, setQ] = useState('');

  const pastEvents: NewsArticle[] = events
    .filter(event => !isFuture(event.date))
    .map(event => ({
      ...event,
      category: 'Portugal · Eventos realizados',
      source: event.gallery || event.source,
    }));

  const pastNews = news.filter(
    article => !isFuture(article.date)
  );

  const records = Array.from(
    new Map(
      [...pastEvents, ...pastNews].map(article => [
        article.slug,
        article,
      ])
    ).values()
  ).sort((a, b) => b.date.localeCompare(a.date));

  const query = normalise(q);

  const selected = records.filter(article =>
    normalise(
      article.title + ' ' +
      article.description + ' ' +
      article.category
    ).includes(query)
  );

  const years = Array.from(
    new Set(
      records.map(article => article.date.slice(0, 4))
    )
  ).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <PageIntro
        label="Notícias"
        title="Acompanhe os nossos últimos eventos."
      >
        Registos de eventos e evangelizações em Portugal.
        A cada evento, temos mais experiências
        maravilhosas com o Senhor.
      </PageIntro>

      <section className="section">
        <div className="container">
          <div className="news-toolbar">
            <span>
              Portugal · Eventos passados

              {years.length > 0 && (
                <> · Registos de {years.join(', ')}</>
              )}
            </span>

            <label className="filter-input">
              <span className="sr-only">
                Pesquisar notícias e eventos
              </span>

              <Icon name="search" />

              <input
                type="search"
                placeholder="Pesquisar notícias e eventos"
                value={q}
                onChange={event =>
                  setQ(event.target.value)
                }
              />
            </label>
          </div>

          <div aria-live="polite">
            {selected.length > 0 ? (
              <div className="news-grid">
                {selected.map(article => (
                  <NewsCard
                    article={article}
                    key={article.slug}
                  />
                ))}
              </div>
            ) : (
              <Empty
                icon="search"
                title="Nenhuma notícia encontrada."
              >
                Experimente pesquisar por outra localidade
                ou apagar o termo de pesquisa.
              </Empty>
            )}
          </div>

          <div className="source-note">
            <Icon name="globe" />

            <p>
              Notícias baseadas nos registos do ESF Portugal.
              As datas correspondem aos acontecimentos.{' '}

              <External href="https://esf.pt/">
                Consultar os registos originais
              </External>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}