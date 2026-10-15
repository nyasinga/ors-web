import { useEffect, useRef } from 'react';
import type { ECitizenPayload } from '../../types/registration';

interface PaymentModalProps {
  isOpen: boolean;
  payload: ECitizenPayload | null;
  onClose: () => void;
  onPaymentComplete: () => Promise<void>;
}

export default function PaymentModal({ isOpen, payload, onClose, onPaymentComplete }: PaymentModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (isOpen && payload && formRef.current) {
      formRef.current.submit(); // Auto-POST parameters inside the iframe target window
    }
  }, [isOpen, payload]);

  if (!isOpen || !payload) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', width: '90%', maxWidth: '800px', borderRadius: '8px', padding: '20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h4 style={{ margin: 0, color: '#333' }}>eCitizen Secure Payment Portal</h4>
          <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', fontWeight: 'bold', fontSize: '16px' }}>✕ Close</button>
        </div>
        
        {/* Hidden configuration routing pipeline targeting iframe handle */}
        <form ref={formRef} action="https://test.pesaflow.com" method="POST" target="ecitizen_iframe" style={{ display: 'none' }}>
          {Object.entries(payload).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value?.toString()} />
          ))}
        </form>

        <iframe name="ecitizen_iframe" style={{ width: '100%', height: '600px', border: '1px solid #eee', borderRadius: '4px' }} title="eCitizen Gateway" />
        
        <div style={{ textAlign: 'right', marginTop: '15px' }}>
          <button onClick={onPaymentComplete} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            I Have Completed Payment ✓
          </button>
        </div>
      </div>
    </div>
  );
}
