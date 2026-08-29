const id = window.location.pathname.split('/').filter(Boolean).pop();
// /cars/2 → '2'

const res = await fetch(`/api/cars/${id}/`);
const car = await res.json();

// ارسم الصفحة
document.getElementById('detail-title').textContent = `${car.brand} ${car.model};`