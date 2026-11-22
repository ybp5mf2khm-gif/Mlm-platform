'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  // حقول التسجيل والدخول
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [message, setMessage] = useState('');

  // حقول طلب السحب
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('تحويل بنكي');
  const [accountDetails, setAccountDetails] = useState('');

  useEffect(() => {
    // التقاط كود الإحالة من الرابط ?ref=XXXX تلقائياً
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setSponsorCode(ref.toUpperCase());
      setIsSignUp(true);
    }

    checkUser();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await loadDashboardData(session.user.id);
    }
    setLoading(false);
  }

  async function loadDashboardData(userId) {
    // 1. جلب بيانات الملف الشخصي
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(userData);

    // 2. جلب بيانات المحفظة
    const { data: walletData } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    setWallet(walletData);

    // 3. جلب أعضاء الفريق في الشجرة (المستويات 1 إلى 3)
    const { data: closureData } = await supabase
      .from('user_closure')
      .select('depth, descendant_id, users!user_closure_descendant_id_fkey(full_name, email, created_at)')
      .eq('ancestor_id', userId)
      .gt('depth', 0)
      .lte('depth', 3)
      .order('depth', { ascending: true });
    
    if (closureData) setTeam(closureData);
  }

  async function handleAuth(e) {
    e.preventDefault();
    setMessage('جاري المعالجة...');

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            sponsor_code: sponsorCode,
          },
        },
      });
      if (error) setMessage('خطأ: ' + error.message);
      else {
        setMessage('تم إنشاء الحساب بنجاح! جاري الدخول...');
        checkUser();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage('خطأ: ' + error.message);
      else {
        setMessage('');
        checkUser();
      }
    }
  }

  async function handlePayout(e) {
    e.preventDefault();
    setMessage('جاري إرسال طلب السحب...');

    const { error } = await supabase.rpc('request_payout', {
      p_user_id: user.id,
      p_amount: parseFloat(withdrawAmount),
      p_method: withdrawMethod,
      p_account_info: { details: accountDetails },
    });

    if (error) {
      setMessage('فشل السحب: ' + error.message);
    } else {
      setMessage('تم إرسال طلب السحب بنجاح وخصمه من رصيدك المتاح!');
      setWithdrawAmount('');
      await loadDashboardData(user.id);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>جاري التحميل...</p>;

  // ========== شاشة تسجيل الدخول والتسجيل ==========
  if (!user) {
    return (
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: '20px' }}>
        <h2 style={{ marginTop: 0 }}>{isSignUp ? 'إنشاء حساب مسوّق جديد' : 'تسجيل الدخول'}</h2>
        {message && <p style={{ padding: '10px', background: '#edf2f7', borderRadius: '6px', fontSize: '14px' }}>{message}</p>}
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isSignUp && (
            <>
              <input type="text" placeholder="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={inputStyle} />
              <input type="text" placeholder="كود الإحالة (اختياري)" value={sponsorCode} onChange={(e) => setSponsorCode(e.target.value.toUpperCase())} style={inputStyle} />
            </>
          )}
          <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <button type="submit" style={btnStyle}>{isSignUp ? 'تسجيل الحساب' : 'دخول'}</button>
        </form>

        <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
          {isSignUp ? 'لديك حساب بالفعل؟ ' : 'ليس لديك حساب؟ '}
          <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#2b6cb0', fontWeight: 'bold', cursor: 'pointer' }}>
            {isSignUp ? 'سجّل الدخول' : 'أنشئ حساباً الآن'}
          </button>
        </p>
      </div>
    );
  }

  // ========== لوحة تحكم المسوق ==========
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${profile?.referral_code}` : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* الترويسة */}
      <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>مرحباً، {profile?.full_name}</h3>
          <small style={{ color: '#718096' }}>كودك الخاص: <strong>{profile?.referral_code}</strong></small>
        </div>
        <button onClick={handleLogout} style={{ padding: '6px 12px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px' }}>خروج</button>
      </div>

      {message && <p style={{ padding: '10px', background: '#ebf8ff', color: '#2b6cb0', borderRadius: '6px', margin: 0 }}>{message}</p>}

      {/* بطاقات المحفظة */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={cardStyle}>
          <small style={{ color: '#718096' }}>الرصيد القابل للسحب</small>
          <h2 style={{ margin: '8px 0 0', color: '#2f855a' }}>{wallet?.available_balance || '0.00'}</h2>
        </div>
        <div style={cardStyle}>
          <small style={{ color: '#718096' }}>الرصيد المعلّق (قيد الحجز)</small>
          <h2 style={{ margin: '8px 0 0', color: '#d69e2e' }}>{wallet?.pending_balance || '0.00'}</h2>
        </div>
      </div>

      {/* رابط الإحالة */}
      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 8px' }}>رابط الدعوة الخاص بك</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="text" readOnly value={referralLink} style={{ ...inputStyle, flex: 1, background: '#f7fafc' }} />
          <button onClick={() => { navigator.clipboard.writeText(referralLink); setMessage('تم نسخ رابط الإحالة!'); }} style={btnStyle}>نسخ</button>
        </div>
      </div>

      {/* نموذج طلب السحب */}
      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 12px' }}>طلب سحب الأرباح</h4>
        <form onSubmit={handlePayout} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="number" step="0.01" placeholder="المبلغ المراد سحبه" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required style={inputStyle} />
          <select value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value)} style={inputStyle}>
            <option value="تحويل بنكي">تحويل بنكي (RIB)</option>
            <option value="USDT">محفظة رقمية (USDT)</option>
            <option value="Wise">Wise</option>
          </select>
          <input type="text" placeholder="رقم الحساب البنكي أو عنوان المحفظة" value={accountDetails} onChange={(e) => setAccountDetails(e.target.value)} required style={inputStyle} />
          <button type="submit" style={btnStyle}>إرسال طلب السحب</button>
        </form>
      </div>

      {/* شجرة الفريق */}
      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 12px' }}>فريقي ({team.length} أعضاء)</h4>
        {team.length === 0 ? (
          <p style={{ color: '#718096', fontSize: '14px' }}>لا يوجد أعضاء في فريقك بعد. شارك رابط الإحالة للبدء!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {team.map((member, idx) => (
              <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between' }}>
                <span>{member.users?.full_name}</span>
                <span style={{ background: '#edf2f7', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>المستوى {member.depth}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const cardStyle = { background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '15px' };
const btnStyle = { padding: '10px 16px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
