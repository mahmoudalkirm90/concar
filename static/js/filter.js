/* ══════════════════════════════════════
   CARS — AVAILABLE & SOLD WITH PAGINATION
══════════════════════════════════════ */

const BASE_URL = 'http://127.0.0.1:8000';
const WHATSAPP_NUMBER = '963931454382'; // بدون +
const INQUIRY_API_URL = 'http://127.0.0.1:8000/api/inquiries/';
const PER_PAGE = 9;

/* ── State ── */
const state = {
  available: { cars: [], page: 1, total: 0, totalPages: 1 },
  sold:      { cars: [], page: 1, total: 0, totalPages: 1 },
  filters: {
    search:       '',
    status:       '',       // new | used | ''
    min_price:    '',
    max_price:    '',
    min_year:     '',
    max_year:     '',
    fuel:         '',
    transmission: '',
    brand:        '',       // ✅ FIX 1: كان موجوداً في HTML لكن ناقصاً من state
    ordering:     '-created_at', // ✅ FIX 2: يتوافق مع قيمة الـ <select> الافتراضية
  },
};

/* ══════════════════════════════════════
   BUILD URL
   ✅ is_available منفصل عن الـ filters
══════════════════════════════════════ */
function buildURL(isAvailable, page) {
  const params = new URLSearchParams({
    is_available: isAvailable,
    page,
    per_page: PER_PAGE,
  });

  Object.entries(state.filters).forEach(([k, v]) => {
    if (v !== '') params.append(k, v);
  });

  const url = `${BASE_URL}/api/cars/?${params.toString()}`;

  return url;
}

/* ══════════════════════════════════════
   FETCH — Available & Sold معاً
══════════════════════════════════════ */
async function fetchAll() {
  showLoading(true);

  try {
    const [resAvail, resSold] = await Promise.all([
      fetch(buildURL(true,  state.available.page)),
      fetch(buildURL(false, state.sold.page)),
    ]);

    if (!resAvail.ok || !resSold.ok) throw new Error('Network error');

    const dataAvail = await resAvail.json();
    const dataSold  = await resSold.json();

    state.available.cars       = dataAvail.results ?? [];
    state.available.total      = dataAvail.count   ?? 0;
    state.available.totalPages = Math.ceil(state.available.total / PER_PAGE);

    state.sold.cars       = dataSold.results ?? [];
    state.sold.total      = dataSold.count   ?? 0;
    state.sold.totalPages = Math.ceil(state.sold.total / PER_PAGE);

    renderSection('available');
    renderSection('sold');
    updateBadges();

  } catch (err) {
    console.error('fetchAll error:', err);
    showError('available', 'تعذّر تحميل السيارات، حاول مجدداً.');
    showError('sold',      'تعذّر تحميل السيارات، حاول مجدداً.');
  } finally {
    showLoading(false);
  }
}

/* فقط قسم واحد عند تغيير صفحته */
async function fetchSection(isAvailable, status) {
  showLoading(true);
  try {
    const res  = await fetch(buildURL(isAvailable, state[status].page));
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();

    state[status].cars       = data.results ?? [];
    state[status].total      = data.count   ?? 0;
    state[status].totalPages = Math.ceil(state[status].total / PER_PAGE);

    renderSection(status);
    updateBadges();
  } catch (err) {
    console.error('fetchSection error:', err);
    showError(status, 'تعذّر تحميل السيارات، حاول مجدداً.');
  } finally {
    showLoading(false);
  }
}

/* ══════════════════════════════════════
   RENDER — بطاقة سيارة
   ✅ is_available للتمييز بين متاح/مباع
   ✅ status للتمييز بين new/used
   ✅ fuel.name و gearbox.name
══════════════════════════════════════ */
function carCardHTML(car) {
  console.log(car)
  const isAvailable = car.is_available;
  const isNew       = car.status === 'new';
  const price       = car.price ? Number(car.price).toLocaleString('ar-SA') : '—';
  const fuelName    = car.fuel    ?? '—';
  const gearName    = car.gearbox ?? '—';

  return `
  <a style="text-decoration:none; color:inherit;" href="${BASE_URL}/cars/${car.id}">
    <div class="car-card ${!isAvailable ? 'is-sold' : ''}">

      ${!isAvailable ? `<div class="ribbon-sold">مباع</div>` : ''}

      <div class="card-badge ${isNew ? 'badge-new' : 'badge-other'}">
        ${isNew ? 'جديد' : 'مستعمل'}
      </div>

      <!-- صورة السيارة — rectangle بدل circle -->
      <div class="car-img-wrap">
        ${car.cover_image
          ? `<img src="${car.cover_image}" alt="${car.model ?? 'سيارة'}" class="car-img ${!isAvailable ? 'greyed' : ''}"/>`
          : `<div class="car-img-placeholder">🚗</div>`
        }
      </div>

      <div style="padding: 1rem 0 1.25rem;">
        <div class="car-name">${car.model ?? '—'}</div>
        <div class="car-meta">${car.model_year ?? ''}</div>

        <div class="car-specs">
          <div>
            <div class="spec-label">السعر</div>
            <div class="spec-value price">${price} $</div>
          </div>
          <div>
            <div class="spec-label">الوقود</div>
            <div class="spec-value">${fuelName}</div>
          </div>
          <div>
            <div class="spec-label">ناقل الحركة</div>
            <div class="spec-value">${gearName}</div>
          </div>
        </div>
      </div>

    </div>
  </a>`;
}

/* ══════════════════════════════════════
   RENDER SECTION
══════════════════════════════════════ */
function renderSection(status) {
  const { cars, page, totalPages, total } = state[status];

  const grid  = document.getElementById(`cars-grid-${status}`);
  const pgEl  = document.getElementById(`pagination-${status}`);
  const label = document.getElementById(`count-${status}`);

  if (label) label.textContent = `${total} سيارة`;
  if (!grid) return;

  if (!cars.length) {
    grid.innerHTML = `<div class="error-msg">لا توجد سيارات في هذا القسم.</div>`;
    if (pgEl) pgEl.innerHTML = '';
    return;
  }

  grid.innerHTML = cars.map(carCardHTML).join('');
  renderPagination(status, page, totalPages);
}

/* ══════════════════════════════════════
   PAGINATION
══════════════════════════════════════ */
function renderPagination(status, currentPage, totalPages) {
  const container = document.getElementById(`pagination-${status}`);
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''}
    onclick="goToPage('${status}', ${currentPage - 1})">‹</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}"
        onclick="goToPage('${status}', ${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span class="page-dots">…</span>`;
    }
  }

  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}
    onclick="goToPage('${status}', ${currentPage + 1})">›</button>`;

  container.innerHTML = html;
}

function goToPage(status, page) {
  state[status].page = page;
  fetchSection(status === 'available', status);
  document.getElementById(`section-${status}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ══════════════════════════════════════
   BADGES & HELPERS
══════════════════════════════════════ */
function updateBadges() {
  const ba = document.getElementById('badge-available');
  const bs = document.getElementById('badge-sold');
  if (ba) ba.textContent = state.available.total;
  if (bs) bs.textContent = state.sold.total;
}

function showLoading(on) {
  const el = document.getElementById('loading-indicator');
  if (el) el.style.display = on ? 'flex' : 'none';
}

function showError(status, msg) {
  const grid = document.getElementById(`cars-grid-${status}`);
  if (grid) grid.innerHTML = `<div class="error-msg">${msg}</div>`;
}

/* ══════════════════════════════════════
   FILTERS
══════════════════════════════════════ */
function setFilter(key, value) {
  state.filters[key]   = value;
  state.available.page = 1;
  state.sold.page      = 1;
  fetchAll();
}

function resetFilters() {
  Object.keys(state.filters).forEach(k =>
    state.filters[k] = k === 'ordering' ? '-created_at' : ''
  );
  state.available.page = state.sold.page = 1;

  ['search-input', 'filter-status', 'filter-brand',  // ✅ FIX 1: أضفنا filter-brand للـ reset
   'filter-min-price', 'filter-max-price',
   'filter-min-year', 'filter-max-year',
   'filter-fuel', 'filter-transmission'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const sortEl = document.getElementById('filter-sort');
  if (sortEl) sortEl.value = '-created_at';

  fetchAll();
}

let searchTimeout;
function onSearchInput(value) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => setFilter('search', value.trim()), 500);
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
loadBrands();
loadFuels();
loadInquiries(1)
  document.getElementById('search-input')
    ?.addEventListener('input', e => onSearchInput(e.target.value));

  const fieldMap = {
    'filter-status':       'status',        // ✅ new | used
    'filter-brand':        'brand',         // ✅ FIX 1: ربط الـ select الموجود في HTML
    'filter-min-price':    'min_price',
    'filter-max-price':    'max_price',
    'filter-min-year':     'min_year',
    'filter-max-year':     'max_year',
    'filter-fuel':         'fuel',
    'filter-transmission': 'transmission',
    'filter-sort':         'ordering',      // ✅ بدل sort
  };

  Object.entries(fieldMap).forEach(([id, key]) => {
    document.getElementById(id)
      ?.addEventListener('change', e => setFilter(key, e.target.value));
  });

  document.getElementById('btn-reset')
    ?.addEventListener('click', resetFilters);

  fetchAll();
});
/* ══════════════════════════════════════
   CONFIG — غيّر هالقيم
══════════════════════════════════════ */


/* ══════════════════════════════════════
   MODAL
══════════════════════════════════════ */
function openInquiry() {
  document.getElementById('inquiry-modal').style.display   = 'block';
  document.getElementById('inquiry-overlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
  clearInquiryForm();
}

function closeInquiry() {
  document.getElementById('inquiry-modal').style.display   = 'none';
  document.getElementById('inquiry-overlay').style.display = 'none';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeInquiry(); });

/* ══════════════════════════════════════
   DATA & VALIDATION
══════════════════════════════════════ */
function getInquiryData() {
  return {
    name:    document.getElementById('inq-name').value.trim(),
    phone:   document.getElementById('inq-phone').value.trim(),
    type :{name : document.getElementById('inq-type').value},
    message: document.getElementById('inq-message').value.trim(),
  };
}

function validateInquiry(data) {
  let valid = true;
  ['name', 'phone', 'message'].forEach(f =>
    document.getElementById(`err-${f}`).textContent = ''
  );

  if (!data.name) {
    document.getElementById('err-name').textContent = 'الاسم مطلوب';
    valid = false;
  }
  if (!data.phone || data.phone.length < 7) {
    document.getElementById('err-phone').textContent = 'رقم الهاتف غير صحيح';
    valid = false;
  }
  if (!data.message) {
    document.getElementById('err-message').textContent = 'الرسالة مطلوبة';
    valid = false;
  }
  return valid;
}

/* ══════════════════════════════════════
   SUBMIT → API
══════════════════════════════════════ */

function getCookie(name) {
  let val = null;
  document.cookie.split(';').forEach(c => {
    const t = c.trim();
    if (t.startsWith(name + '='))
      val = decodeURIComponent(t.slice(name.length + 1));
  });
  return val;
}

async function submitInquiry() {
  const data = getInquiryData();

  console.log("")
  if (!validateInquiry(data)) return;

  const btn   = document.getElementById('inq-submit-btn');
  const toast = document.getElementById('inq-toast');

  btn.disabled    = true;
  btn.textContent = 'جاري الإرسال...';
  toast.className = 'inq-toast';

  try {
    const res = await fetch(INQUIRY_API_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken':  getCookie('csrftoken'),  // ← الإضافة
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    toast.textContent = '✓ تم إرسال استفسارك بنجاح';
    toast.className   = 'inq-toast visible success';
    setTimeout(() => closeInquiry(), 2000);

  } catch (err) {
    toast.textContent = 'حدث خطأ، حاول مجدداً';
    toast.className   = 'inq-toast visible error';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'إرسال';
  }
}

/* ══════════════════════════════════════
   WHATSAPP → رابط مباشر
══════════════════════════════════════ */
function sendWhatsapp() {
  const data = getInquiryData();
  if (!validateInquiry(data)) return;

  const typeLabel = {
    available: 'سيارة متاحة',
    sold:      'سيارة مباعة',
    general:   'استفسار عام',
  }[data.type] ?? '';

  const text = `مرحباً،\n\nالاسم: ${data.name}\nالهاتف: ${data.phone}\nنوع الاستفسار: ${typeLabel}\n\n${data.message}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
}

/* ══════════════════════════════════════
   CLEAR
══════════════════════════════════════ */
function clearInquiryForm() {
  ['inq-name', 'inq-phone', 'inq-message'].forEach(id =>
    document.getElementById(id).value = ''
  );
  document.getElementById('inq-type').value = 'available';
  ['name', 'phone', 'message'].forEach(f =>
    document.getElementById(`err-${f}`).textContent = ''
  );
  const toast = document.getElementById('inq-toast');
  toast.className = 'inq-toast';
  toast.textContent = '';
}
/* ══════════════════════════════════════
   LOAD BRANDS — يملأ قائمة البراندات من الـ API
   يحتاج endpoint على الباكند:
   GET /api/brands/  →  [{ id, name }, ...]
══════════════════════════════════════ */
async function loadBrands() {
  try {
    const res  = await fetch('/api/cars/brands/');
    if (!res.ok) throw new Error("HTTP ${res.status}");

    const data = await res.json();

    // DRF pagination → results | أو array مباشر
    const brands = data.results ?? data;

    const select = document.getElementById('filter-brand');
    if (!select) return;

    // أضف كل براند كـ option
    brands.forEach(brand => {
      const option   = document.createElement('option');
      option.value   = brand.name;   // يُرسل كـ ?brand=Toyota
      option.textContent = brand.name;
      select.appendChild(option);
    });

  } catch (err) {
    console.error('loadBrands error:', err);
  }
}

async function loadFuels() {
  try {
    const res  = await fetch('/api/cars/fuels/');
    if (!res.ok) throw new Error("HTTP ${res.status}");

    const data   = await res.json();
    const fuels  = data.results ?? data;

    const select = document.getElementById('filter-fuel');
    if (!select) return;

    fuels.forEach(fuel => {
      const option     = document.createElement('option');
      option.value     = fuel.name;
      option.textContent = fuel.name;
      select.appendChild(option);
    });

  } catch (err) {
    console.error('loadFuels error:', err);
  }
}
// ══ INQUIRIES ══
// ══ INQUIRIES ══
const INQUIRIES_API_URL = '/api/inquiries/';
const INQ_TYPE_LABELS = { general: 'استفسار عام', sold: 'سيارة مباعة', available: 'سيارة متاحة', unavailable: 'سيارة غير موجودة' };
const INQ_TYPE_COLORS = { general: 'black', sold: '#eb5757', available: '#6fcf97', unavailable:"#f3950aff"};

let inqCurrentPage = 1;

async function loadInquiries(page = 1) {
  const grid    = document.getElementById('inquiries-grid');
  const loading = document.getElementById('inquiries-loading');
  const error   = document.getElementById('inquiries-error');
  const count   = document.getElementById('count-inquiries');
  const pag     = document.getElementById('pagination-inquiries');

  loading.style.display = 'flex';
  grid.style.display    = 'none';
  error.style.display   = 'none';

  try {
    const res  = await fetch(`${INQUIRIES_API_URL}?page=${page}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    count.textContent = data.count;
    grid.innerHTML    = '';

    if (!data.results.length) {
      grid.innerHTML = '<div class="error-msg ">لا توجد استفسارات بعد.</div>';
    } else {
      data.results.forEach(inq => {
        const typeName  = inq.type?.name  ?? 'general';
        const typeLabel = INQ_TYPE_LABELS[typeName] ?? typeName;
        const typeColor = INQ_TYPE_COLORS[typeName] ?? 'var(--gold-op-40)';

        // بناء رسالة الواتساب
        const waLines = [
          `مرحباً ${inq.name ?? ''}،`,
          `بخصوص استفساركم`,
          inq.brand  ? `الماركة: ${inq.brand}`   : '',
          inq.budget ? `الميزانية: ${Number(inq.budget).toLocaleString('ar-SA')} ر.س` : '',
          inq.message ? `\nرسالتكم: "${inq.message}"` : '',
        ].filter(Boolean).join('\n');

        const waURL   = WHATSAPP_NUMBER
          ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waLines)}`
          : null;

        const card = document.createElement('div');
        card.className = 'inquiry-card';

        card.innerHTML = `
          <span class="card-badge badge-other" style="border-color:${typeColor}; color:${typeColor};">
            ${typeLabel}
          </span>

          <div class="car-name">${inq.name ?? '—'}</div>
          ${inq.phone
            ? `<div class="car-meta">${inq.phone}</div>`
            : '<div style="margin-bottom:1.5rem;"></div>'
          }

          ${(inq.brand || inq.budget) ? `
            <div class="car-specs">
              ${inq.brand  ? `<div><div class="spec-label">الماركة</div><div class="spec-value">${inq.brand}</div></div>` : ''}
              ${inq.budget ? `<div><div class="spec-label">الميزانية</div><div class="spec-value price">${Number(inq.budget).toLocaleString('ar-SA')} ر.س</div></div>` : ''}
            </div>
          ` : ''}

          <div class="card-divider"></div>

          <div class="spec-value" style="line-height:1.85; margin-top:1rem; font-size:0.82rem;">
            ${inq.message ?? '<span style="opacity:0.35">لا توجد رسالة</span>'}
          </div>

          ${inq.created_at ? `
            <div class="spec-label" style="margin-top:0.75rem;">
              ${new Date(inq.created_at).toLocaleDateString('ar-SA', { year:'numeric', month:'short', day:'numeric' })}
            </div>
          ` : ''}

          <!-- زر الواتساب -->
          <div style="margin-top:1.25rem;">
            ${waURL
              ? `<a href="${waURL}" target="_blank" rel="noopener" class="wa-reply-btn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.858L.057 23.552a.75.75 0 0 0 .921.921l5.694-1.478A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.718 9.718 0 0 1-5.002-1.384l-.36-.214-3.733.969.991-3.625-.235-.374A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                  </svg>
                  رد عبر واتساب
                </a>`
              : `<span class="wa-reply-btn wa-reply-disabled">لا يوجد رقم</span>`
            }
          </div>
        `;

        grid.appendChild(card);
      });
    }

    renderInquiriesPagination(data, page, pag);
    loading.style.display = 'none';
    grid.style.display    = 'grid';

  } catch (err) {
    loading.style.display = 'none';
    error.style.display   = 'block';
    console.error('Inquiries fetch error:', err);
  }
}

function renderInquiriesPagination(data, currentPage, container) {
  const totalPages = Math.ceil(data.count / 5); // page_size افتراضي 5
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''}
    onclick="goToInquiryPage(${currentPage - 1})">‹</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}"
        onclick="goToInquiryPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span class="page-dots">…</span>`;
    }
  }

  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}
    onclick="goToInquiryPage(${currentPage + 1})">›</button>`;

  container.innerHTML = html;
}

function goToInquiryPage(page) {
  inqCurrentPage = page;
  loadInquiries(page);
  document.getElementById('section-inquiries')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
