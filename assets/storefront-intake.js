/* Wanelle — integra o formulário da vitrine ao fluxo interno de orçamentos. */
(function () {
  'use strict';
  const form = document.getElementById('orderForm');
  if (!form) return;
  const $ = id => document.getElementById(id);
  const startedAt = Date.now();
  const button = $('sendBudget');
  const feedback = $('orderFeedback');
  const waNumber = '5571993125721';
  let saving = false, intakeReady = false;
  const referenceIds = {
    'Torta de chocolate com raspas': 'chocolate-raspas',
    'Torta de abacaxi com coco': 'abacaxi',
    'Torta de morango com wafer': 'morango',
    'Torta rosa delicada': 'rosa',
    'Torta de formatura Administração': 'administracao',
    'Torta tema boteco': 'boteco',
    'Torta de kiwi e uvas': 'kiwi',
    'Torta temática de super-herói': 'heroi',
    'Torta temática Barbie': 'barbie'
  };
  const val = id => String($(id)?.value || '').trim();
  const digits = id => val(id).replace(/\D/g, '');
  const whats = message => 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message);
  const today = () => {
    const d = new Date(), local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };
  const dateBR = date => /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.split('-').reverse().join('/') : 'a combinar';
  function show(heading, message, label, url) {
    feedback.hidden = false;
    feedback.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = heading;
    const detail = document.createElement('p');
    detail.textContent = message;
    feedback.append(title, detail);
    if (url) {
      const link = document.createElement('a');
      link.className = 'btn btn-crimson';
      link.href = url;
      link.rel = 'noopener';
      link.target = '_blank';
      link.textContent = label || 'Abrir WhatsApp ↗';
      feedback.append(link);
    }
    feedback.scrollIntoView({ behavior: 'auto', block: 'nearest' });
  }
  // O servidor só confirma a gravação após ativação de autenticação e controles de abuso.
  fetch('/api/wanelle?action=health', { cache: 'no-store', credentials: 'same-origin' })
    .then(res => res.ok ? res.json() : null)
    .then(info => { intakeReady = !!info?.intakeReady; })
    .catch(() => { intakeReady = false; });
  $('data').min = today();
  $('tamanho').addEventListener('change', () => {
    const defaults = { '18': '16', '20': '22', '25': '32' };
    if (!val('pessoas') && defaults[val('tamanho')]) $('pessoas').value = defaults[val('tamanho')];
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (saving || !form.reportValidity()) return;
    if (val('website')) return;
    const phone = digits('telefone'), date = val('data'), servings = Number(val('pessoas'));
    if (phone.length < 10 || phone.length > 13) {
      show('Confira seu WhatsApp', 'Informe o número com DDD para que nossa equipe possa responder.');
      $('telefone').focus();
      return;
    }
    if (!date || date < today()) {
      show('Confira a data', 'Escolha uma data de hoje em diante.');
      $('data').focus();
      return;
    }
    if (!Number.isInteger(servings) || servings < 1 || servings > 500) {
      show('Confira o número de pessoas', 'Informe um valor entre 1 e 500.');
      $('pessoas').focus();
      return;
    }
    const savedNames = (window.WANELLE_SITE_SELECTION?.() || []).filter(name => !!referenceIds[name]);
    const size = Number(val('tamanho'));
    const data = {
      customer: val('nome'),
      phone: phone.startsWith('55') ? phone : '55' + phone,
      eventDate: date,
      occasion: val('ocasiao'),
      servings,
      items: savedNames.length ? savedNames.map(name => ({ referenceId: referenceIds[name], recipeId: '', qty: 1 })) : [{ referenceId: '', recipeId: '', qty: 1 }],
      method: val('entrega'),
      neighborhood: val('bairro'),
      custom: true,
      flavor: val('sabor'),
      filling: val('recheio'),
      decoration: val('ideias'),
      notes: '',
      fillingLayers: Number(val('camadas')) || 2,
      decorationLevel: val('decoracaoNivel'),
      sizeCm: [18,20,25].includes(size) ? size : null,
      source: 'site-visual-2026',
      website: val('website'),
      privacyAccepted: $('privacidade').checked,
      clientStartedAt: startedAt
    };
    const message = [
      'Olá, Wanelle! Gostaria de um orçamento de torta ♡',
      'Nome: ' + data.customer,
      'WhatsApp: ' + data.phone,
      'Data desejada: ' + dateBR(date),
      'Pessoas: ' + servings,
      'Tamanho: ' + (data.sizeCm ? data.sizeCm + ' cm' : 'a combinar'),
      'Ocasião: ' + (data.occasion || 'a combinar'),
      'Massa: ' + (data.flavor || 'a combinar'),
      'Recheio: ' + (data.filling || 'a combinar'),
      'Camadas: ' + data.fillingLayers + ' (a confirmar)',
      'Decoração: ' + data.decorationLevel,
      'Recebimento: ' + data.method,
      'Bairro: ' + (data.neighborhood || 'a combinar'),
      'Inspirações: ' + (savedNames.join(', ') || 'criação personalizada'),
      'Ideias: ' + (data.decoration || 'a combinar'),
      'Este é um pedido de orçamento, ainda não uma encomenda confirmada.'
    ].join('\n');
    const fallback = whats(message);
    const core = window.WanelleCore;
    if (!core?.live || !intakeReady) {
      show('Continuar pelo WhatsApp', 'Sua mensagem está pronta para enviar. O orçamento ainda não foi registrado automaticamente no sistema.', 'Abrir WhatsApp ↗', fallback);
      return;
    }
    saving = true;
    button.disabled = true;
    button.textContent = 'Registrando sua solicitação...';
    try {
      const saved = await core.publicSubmit(data);
      form.hidden = true;
      show('Solicitação registrada ♡',
        'Código ' + saved.id + '. A equipe vai conferir sua agenda, os custos e a disponibilidade. O orçamento ainda não foi aprovado nem confirmado.',
        'Continuar pelo WhatsApp ↗',
        whats('Olá, Wanelle! Enviei a solicitação ' + saved.id + ' pelo site. Sou ' + data.customer + '. Podemos continuar meu orçamento?'));
    } catch (error) {
      show('Continue pelo WhatsApp',
        'Não foi possível registrar esta solicitação no sistema. Nada foi confirmado automaticamente. Você ainda pode enviar a mensagem à equipe.',
        'Enviar mensagem ↗', fallback);
    } finally {
      saving = false;
      button.disabled = false;
      button.textContent = 'Solicitar orçamento ↗';
    }
  });
})();