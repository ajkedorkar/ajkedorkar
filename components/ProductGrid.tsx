interface Product {
  id: number;
  name: string;
  price: string;
  img: string;
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div style={{ marginTop: '30px' }}>
      <div style={{ 
        borderBottom: '2px solid #e62e04', display: 'inline-block', 
        paddingBottom: '5px', fontWeight: 'bold', fontSize: '18px' 
      }}>
        JUST FOR YOU
      </div>
      <div className="prod-grid" style={{ display: 'grid', gap: '12px', marginTop: '15px' }}>
        {[...products, ...products].map((p, idx) => (
          <div key={idx} className="prod-card" style={{ 
            background: 'white', borderRadius: '4px', overflow: 'hidden', border: '1px solid #eee' 
          }}>
            <img src={p.img} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            <div style={{ padding: '12px' }}>
              <div className="prod-name" style={{ fontSize: '13px', color: '#333', height: '36px', overflow: 'hidden' }}>
                {p.name}
              </div>
              <div className="prod-price" style={{ color: '#e62e04', fontWeight: 'bold', fontSize: '16px', marginTop: '8px' }}>
                ৳{p.price}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}