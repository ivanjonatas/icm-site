import React, {useId} from 'react';
import type {Church} from '../types';
import photosData from '../church-photos.json';
import {Icon, External} from './ui';
import './ChurchCard.css';

type ChurchPhoto = {
  src: string;
  alt: string;
  caption: string;
  author: string;
  source: string;
  license: string;
  licenseUrl: string;
};

const photos: Record<string, ChurchPhoto> = photosData;

export function ChurchCard({church}: {church: Church}) {
  const photo = photos[church.id];
  const gradientId = useId();
  const instagramHandle = church.instagram ? '@' + new URL(church.instagram).pathname.split('/').filter(Boolean)[0] : '';

  return (
    <article className="church-card church-card--photo" data-church-card={church.id}>
      {photo && (
        <figure className="church-card__figure">
          <div className="church-card__photo-frame">
            <img className="church-card__photo" src={photo.src} alt={photo.alt}
              width="960" height="600" loading="lazy" decoding="async" />
          </div>
          <figcaption className="church-card__caption">
            <span className="church-card__photo-label">{photo.caption}</span>
            <span className="church-card__photo-credit">
              <a href={photo.source} target="_blank" rel="noopener noreferrer"
                title="Consultar a origem e os créditos da fotografia">
                Foto: {photo.author}
              </a>
              <span aria-hidden="true"> · </span>
              <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer"
                title="Fotografia redimensionada e convertida para WebP, sem recorte">
                {photo.license}
              </a>
            </span>
          </figcaption>
        </figure>
      )}

      <div className="church-card__body">
        <div className="church-card-top">
          <span className="church-pin"><Icon name="pin" /></span>
          <small>{church.region}</small>
        </div>
        <h2>{church.name}</h2>
        <p className="church-address">{church.address}</p>
        {church.schedule.length > 0 ? <details>
          <summary>
            <span><Icon name="clock" />Horários dos cultos</span>
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
            Horas locais de Portugal continental. As reuniões por Zoom dependem
            da informação da congregação.
          </p>
        </details> : <p className="small-note church-card__schedule-note">Consulte os horários dos cultos no Instagram da igreja.</p>}
        <div className="church-card__actions">
        {church.instagram && <a className="church-card__instagram" href={church.instagram}
          target="_blank" rel="noopener noreferrer" aria-label={'Instagram da igreja de ' + church.name + ': ' + instagramHandle + ' (abre num novo separador)'}>
          <svg className="church-card__instagram-icon" viewBox="0 0 24 24" fill="none" stroke={'url(#' + gradientId + ')'} strokeWidth="1.8" aria-hidden="true">
            <defs><linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#f9a63a"/><stop offset="45%" stopColor="#e1306c"/><stop offset="100%" stopColor="#833ab4"/></linearGradient></defs>
            <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill={'url(#' + gradientId + ')'} stroke="none"/>
          </svg><span>{instagramHandle}</span>
        </a>}
        <External className="text-link" href={
          'https://www.google.com/maps/search/?api=1&query=' +
          encodeURIComponent(church.address + ', Portugal')
        }>
          Obter direções
        </External>
        </div>
      </div>
    </article>
  );
}

