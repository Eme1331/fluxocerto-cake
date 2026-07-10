import { useState } from 'react';
import { Card, Field, Input, Button } from './ui';
import { validateLicense } from '../utils/activation';

export default function ActivationGate({ onActivated }) {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const confirmar = async () => {
    if (!codigo.trim()) {
      setErro('Digite o código de ativação.');
      return;
    }
    setCarregando(true);
    setErro('');
    const result = await validateLicense({ chave: codigo, email });
    setCarregando(false);
    if (result.success) {
      onActivated();
    } else {
      setErro(result.error);
    }
  };

  return (
    <div className="app-shell items-center justify-center px-6">
      <div className="w-full max-w-xs mx-auto text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/25 flex items-center justify-center text-4xl mb-5">
          🎂
        </div>
        <h1 className="text-xl font-bold text-text mb-1">FluxoCerto - Cake</h1>
        <p className="text-sm text-text-light mb-6">
          Digite o e-mail e o código de ativação enviados no seu pedido para liberar o app.
        </p>

        <Card>
          <Field label="E-mail">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </Field>
          <Field label="Código de ativação">
            <Input
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value);
                setErro('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && confirmar()}
              placeholder="Ex: LEAN-XXXX-XXXX-XXXX"
              className="text-center tracking-widest font-bold uppercase"
            />
          </Field>
          {erro && <p className="text-xs text-danger font-semibold -mt-2 mb-3">{erro}</p>}
          <Button className="w-full" onClick={confirmar} disabled={carregando}>
            {carregando ? 'Validando...' : 'Ativar app'}
          </Button>
        </Card>

        <p className="text-xs text-text-light mt-5">
          Não tem um código? Entre em contato com quem te vendeu o app.
        </p>
      </div>
    </div>
  );
}
