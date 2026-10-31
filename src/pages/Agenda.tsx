import React from 'react';
import {events, isFuture} from '../data';

import {
  PageIntro,
  Empty,
  External,
} from '../components/ui';

import {EventRow} from '../components/content';

export function Agenda() {
  const upcomingEvents = events
    .filter(event => isFuture(event.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <PageIntro
        label="Agenda"
        title="Encontros que nos aproximam."
      >
        Acompanhe os próximos eventos confirmados da
        Igreja Cristã Maranata em Portugal.
      </PageIntro>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>Próximos eventos</h2>
            </div>
          </div>

          <div
            className="agenda-results"
            aria-live="polite"
          >
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <EventRow
                  key={event.slug}
                  event={event}
                />
              ))
            ) : (
              <Empty title="Os próximos encontros serão anunciados em breve.">
                A programação será publicada aqui assim
                que as datas forem confirmadas.
              </Empty>
            )}
          </div>

          <div className="agenda-follow">
            <p>
              Acompanhe também as informações do
              Evangelho Sem Fronteiras em Portugal.
            </p>

            <External
              href="https://esf.pt/"
              className="text-link"
            >
              Acompanhar o ESF Portugal
            </External>
          </div>

          <p className="small-note">
            Datas apresentadas no fuso Europe/Lisbon.
            Os horários dos cultos estão disponíveis
            no diretório de igrejas.
          </p>
        </div>
      </section>
    </>
  );
}