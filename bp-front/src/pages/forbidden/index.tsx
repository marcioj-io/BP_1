import React from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'

import SvgComponent from '../../assets/images/Robot.svg'

const Forbidden: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center space-y-4 pb-5 text-center text-base text-text">
        <img src={SvgComponent} alt="Robot" />
        <h1 className="font-bold">Não Autorizado</h1>
        <p>
          Você não tem permissão de acessar a página atual. Se acredita que isso
          é um problema, por favor entre em contato com o administrador do site.
        </p>
      </div>
      <Button onClick={() => navigate(-1)}>Voltar</Button>
    </div>
  )
}
export default Forbidden
