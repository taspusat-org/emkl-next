const ua =
  typeof window !== 'undefined' ? window.navigator?.userAgent ?? '' : '';

function searchMobil(ua) {
  const regex =
    /Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|mini/i;
  return regex.test(ua);
}

export const ie = ua.includes('MSIE ') || ua.includes('Trident/');

export const mobile =
  typeof window !== 'undefined' &&
  window.hasOwnProperty('ontouchstart') &&
  searchMobil(ua);

export const ieMobile = /iemobile/i.test(ua);

export const iphone = /iphone/i.test(ua) && !ieMobile;
