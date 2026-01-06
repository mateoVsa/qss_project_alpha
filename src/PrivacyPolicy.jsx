const PrivacyPolicy = () => {
  return (
    <div className="container admin-con py-5 d-flex justify-content-center">
      <div style={{ maxWidth: "800px" }}>

        <h1 className="fw-bold text-center mb-4">
          Política de Privacidad
        </h1>

        <p className="text-center text-muted mb-5">
          Última actualización: {new Date().toLocaleDateString()}
        </p>

        <p className="mb-4">
          <strong>Quito Smiles Suites</strong> se compromete a proteger la privacidad de sus clientes y
          usuarios conforme a lo dispuesto en la Ley Orgánica de Protección de Datos Personales del Ecuador.
          Esta política describe cómo recopilamos, utilizamos y protegemos su información personal.
        </p>

        <h5 className="mt-4 mb-2 fw-semibold">1. Datos que recopilamos</h5>
        <p className="mb-3">
          Recopilamos información personal que usted proporciona directamente al registrarse,
          realizar una reserva o utilizar nuestros servicios, incluyendo nombre, correo electrónico,
          información de contacto, datos de identificación, información de facturación y datos necesarios
          para la correcta prestación de nuestros servicios.
        </p>

        <h5 className="mt-4 mb-2 fw-semibold">2. Finalidad del tratamiento</h5>
        <p className="mb-3">
          Los datos personales son tratados exclusivamente para la gestión de reservas, facturación,
          comunicación con el cliente, cumplimiento de obligaciones legales y mejora de nuestros servicios.
        </p>

        <h5 className="mt-4 mb-2 fw-semibold">3. Derechos del titular</h5>
        <p className="mb-2">
          El titular de los datos personales tiene derecho a:
        </p>
        <ul className="mb-3">
          <li>Acceder a sus datos personales.</li>
          <li>Solicitar la rectificación de información inexacta o incompleta.</li>
          <li>Solicitar la eliminación de sus datos personales.</li>
          <li>Revocar su consentimiento para el tratamiento de sus datos.</li>
        </ul>

        <h5 className="mt-4 mb-2 fw-semibold">4. Seguridad de la información</h5>
        <p className="mb-3">
          Quito Smiles Suites implementa medidas técnicas, organizativas y administrativas adecuadas
          para proteger los datos personales contra acceso no autorizado, pérdida, alteración o divulgación.
        </p>

        <h5 className="mt-4 mb-2 fw-semibold">5. Conservación de los datos</h5>
        <p className="mb-3">
          Los datos personales serán conservados únicamente durante el tiempo necesario para cumplir
          con las finalidades para las cuales fueron recopilados y para atender obligaciones legales.
        </p>

        <h5 className="mt-4 mb-2 fw-semibold">6. Contacto</h5>
        <p className="mb-4">
          Para ejercer sus derechos o realizar consultas relacionadas con esta política,
          puede contactarnos al correo electrónico:
          <br />
          <strong>info@quitosmilessuites.com</strong>
        </p>

        <p className="text-center text-muted mt-5">
          © {new Date().getFullYear()} Quito Smiles Suites. Todos los derechos reservados.
        </p>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
