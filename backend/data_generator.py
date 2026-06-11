import random
from datetime import date, timedelta

SERVICES = [
    ("Basic Wash",        8.00,  12.00, 0.28),
    ("Standard Wash",    14.00,  18.00, 0.24),
    ("Premium Wash",     22.00,  26.00, 0.18),
    ("Full Detail",      79.00,  95.00, 0.06),
    ("Interior Clean",   40.00,  55.00, 0.08),
    ("Wax Treatment",    20.00,  28.00, 0.07),
    ("Tire & Rim Clean", 12.00,  18.00, 0.05),
    ("Hand Polish",      30.00,  40.00, 0.04),
]


def generate_transactions(count: int = 200, days: int = 180):
    """Returns list of (date_str, item, amount, customer_id) tuples, sorted by date asc."""
    rng = random.Random(42)

    service_names    = [s[0] for s in SERVICES]
    service_weights  = [s[3] for s in SERVICES]
    service_min      = {s[0]: s[1] for s in SERVICES}
    service_max      = {s[0]: s[2] for s in SERVICES}

    regulars     = [f"C{i:03d}" for i in range(1, 41)]   # C001-C040
    one_timer_id = 1
    results = []

    end_date   = date.today()
    start_date = end_date - timedelta(days=days - 1)

    for _ in range(count):
        # Pick date
        offset    = rng.randint(0, days - 1)
        tx_date   = start_date + timedelta(days=offset)
        date_str  = tx_date.isoformat()

        # Pick service
        [svc] = rng.choices(service_names, weights=service_weights, k=1)
        amount = round(rng.uniform(service_min[svc], service_max[svc]), 2)

        # Pick customer
        if rng.random() < 0.65:
            customer_id = rng.choice(regulars)
        else:
            customer_id = f"N{one_timer_id:04d}"
            one_timer_id += 1

        results.append((date_str, svc, amount, customer_id))

    results.sort(key=lambda r: r[0])
    return results
