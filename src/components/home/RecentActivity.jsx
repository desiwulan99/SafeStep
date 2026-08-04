import { Compass, MapPin, ShieldCheck, Heart } from "lucide-react";
import "./RecentActivity.css";

const TYPE_META = {
  route: { Icon: Compass, label: "Rute Aman" },
  report: { Icon: MapPin, label: "Laporan" },
  guardian: { Icon: ShieldCheck, label: "Live Guardian" },
  sos: { Icon: Heart, label: "SOS" },
};

export default function RecentActivity({ items = [] }) {
  if (items.length === 0) {
    return (
      <section className="recent-activity recent-activity--empty">
        <h2>Aktivitas Terkini</h2>
        <p>Belum ada aktivitas. Mulai cari rute aman atau aktifkan Live Guardian.</p>
      </section>
    );
  }

  return (
    <section className="recent-activity">
      <h2>Aktivitas Terkini</h2>
      <ul className="recent-activity__list">
        {items.map((item) => {
          const meta = TYPE_META[item.type] || TYPE_META.route;
          const { Icon } = meta;
          return (
            <li key={item.id} className="recent-activity__item">
              <span className="recent-activity__icon">
                <Icon size={17} strokeWidth={2.2} />
              </span>
              <div className="recent-activity__body">
                <p className="recent-activity__title">{item.title}</p>
                <p className="recent-activity__meta">
                  {meta.label} · {item.time}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
