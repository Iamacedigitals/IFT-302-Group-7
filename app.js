/* GridConnect frontend demo.
   Uses localStorage only for development. Replace demo storage with PHP API calls before production. */
(() => {
  'use strict';
  const KEYS = { users:'gc_users_v1', bills:'gc_bills_v1', payments:'gc_payments_v1', session:'gc_session_v1', lastReceipt:'gc_last_receipt_v1' };
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const money = n => new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(Number(n)||0);
  const read = (key, fallback=[]) => { try { const v=JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const today = () => new Date().toISOString();
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const session = () => read(KEYS.session, null);
  const currentUser = () => { const s=session(); return s ? read(KEYS.users,[]).find(u=>u.email===s.email) : null; };

  function seed() {
    if (!localStorage.getItem(KEYS.users)) write(KEYS.users,[
      {name:'Amina Bello',email:'amina.bello@example.ng',phone:'+234 800 000 0000',address:'Lagos, Nigeria',meter:'45012345678',password:'Password123!',role:'customer'},
      {name:'GridConnect Admin',email:'admin@gridconnect.ng',phone:'',address:'',meter:'',password:'Admin123!',role:'admin'}
    ]);
    if (!localStorage.getItem(KEYS.bills)) write(KEYS.bills,[
      {id:'BIL-2026-001',email:'amina.bello@example.ng',meter:'45012345678',period:'Sep 1 – Sep 30, 2026',units:325,due:'Oct 25, 2026',amount:18450,status:'Pending',created:today()},
      {id:'BIL-2026-000',email:'amina.bello@example.ng',meter:'45012345678',period:'Aug 1 – Aug 31, 2026',units:290,due:'Sep 15, 2026',amount:16200,status:'Paid',created:today()}
    ]);
    if (!localStorage.getItem(KEYS.payments)) write(KEYS.payments,[]);
  }
  seed();

  function message(el, text, type='error') {
    if (!el) return;
    el.textContent=text; el.hidden=false;
    el.classList.remove('form-message--error','form-message--success');
    el.classList.add(type==='success'?'form-message--success':'form-message--error');
  }
  function setSession(user) { write(KEYS.session,{email:user.email,role:user.role,created:today()}); }
  function logout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem(KEYS.session);
    location.href='login.html';
  }
  $$('a[href="login.html"]').forEach(a=>{ if (/logout/i.test(a.textContent)) a.addEventListener('click',logout); });

  // Mobile navigation: open from the hamburger; close with backdrop, Escape, or a link.
  const menuToggle=$('.mobile-menu-toggle');
  const sidebar=$('.sidebar');
  const backdrop=$('.sidebar-backdrop');
  function closeMenu(){ document.body.classList.remove('menu-open'); menuToggle?.setAttribute('aria-expanded','false'); menuToggle?.setAttribute('aria-label','Open navigation menu'); }
  function openMenu(){ document.body.classList.add('menu-open'); menuToggle?.setAttribute('aria-expanded','true'); menuToggle?.setAttribute('aria-label','Close navigation menu'); }
  menuToggle?.addEventListener('click',()=>document.body.classList.contains('menu-open')?closeMenu():openMenu());
  backdrop?.addEventListener('click',closeMenu);
  sidebar?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});

  const path=location.pathname.split('/').pop() || 'index.html';
  if (path==='index.html') location.replace('login.html');

  const loginForm=$('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit',e=>{
      e.preventDefault();
      const email=$('#email').value.trim().toLowerCase(), password=$('#password').value;
      const user=read(KEYS.users,[]).find(u=>u.email.toLowerCase()===email && u.password===password);
      if(!user){message($('#login-message'),'Email or password is incorrect. Please try again.');return;}
      setSession(user); location.href=user.role==='admin'?'admin-dashboard.html':'dashboard.html';
    });
  }

  const registerForm=$('#register-form');
  if(registerForm) {
    registerForm.addEventListener('submit',e=>{
      e.preventDefault();
      const data=new FormData(registerForm);
      const name=String(data.get('full_name')||'').trim(), email=String(data.get('email')||'').trim().toLowerCase();
      const password=String(data.get('password')||''), confirm=String(data.get('confirm_password')||'');
      const phone=String(data.get('phone')||'').trim();
      const meter=String(data.get('meter_number')||'').trim();
      // Format rule chosen for this project: local Nigerian mobile number, exactly 11 digits.
      if(!/^0[789]\d{9}$/.test(phone)){message($('#register-message'),'Enter a valid 11-digit Nigerian mobile number starting with 070–079, 080–089, or 090–099.');$('#phone')?.focus();return;}
      if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){message($('#register-message'),'Enter a valid email address.');$('#email')?.focus();return;}
      if(!meter){message($('#register-message'),'Please enter your meter number.');$('#meter-number')?.focus();return;}
      if(password!==confirm){message($('#register-message'),'Your passwords do not match.');$('#confirm-password')?.focus();return;}
      const users=read(KEYS.users,[]);
      if(users.some(u=>u.email.toLowerCase()===email)){message($('#register-message'),'An account with this email already exists. Please log in.');return;}
      if(users.some(u=>u.meter===meter)){message($('#register-message'),'That meter number is already registered.');return;}
      users.push({name,email,phone,address:String(data.get('address')||'').trim(),meter,password,role:'customer'});
      write(KEYS.users,users);
      const bills=read(KEYS.bills,[]);
      bills.unshift({id:'BIL-'+Date.now(),email,meter,period:new Date().toLocaleString('en',{month:'short',year:'numeric'}),units:0,due:new Date(Date.now()+14*86400000).toLocaleDateString('en-GB'),amount:0,status:'No bill',created:today()});
      write(KEYS.bills,bills);
      message($('#register-message'),'Account created. Taking you to login…','success');
      setTimeout(()=>location.href='login.html',700);
    });
  }

  function requireRole(role) {
    const user=currentUser();
    if (!user) { location.replace('login.html'); return null; }
    if (role && user.role!==role) { location.replace(user.role==='admin'?'admin-dashboard.html':'dashboard.html'); return null; }
    return user;
  }

  // Customer pages
  if (['dashboard.html','previous-bills.html','transactions.html','make-payment.html','receipt.html'].includes(path)) {
    const user=requireRole('customer');
    if(user) {
      const name=$('header.topbar .user-name'); if(name) name.textContent=user.name;
      const avatar=$('header.topbar .user-avatar'); if(avatar) avatar.textContent=(user.name||'U').trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
      const nameEl=$('#customer-name'); if(nameEl) nameEl.textContent=user.name;
      const emailEl=$('#customer-email'); if(emailEl) emailEl.textContent=user.email;
      const meterEl=$('#customer-meter'); if(meterEl) meterEl.textContent=user.meter;
      if(path==='dashboard.html') {
        const latest=read(KEYS.bills,[]).find(b=>b.email===user.email && b.status!=='Paid');
        if(latest) {
          const period=$('#bill-period'); if(period) period.textContent=latest.period;
          const status=$('#bill-status'); if(status) status.textContent=latest.status;
          const units=$('#bill-units'); if(units) units.textContent=`${latest.units} kWh`;
          const due=$('#bill-due'); if(due) due.textContent=latest.due;
          const amount=$('#bill-amount'); if(amount) amount.textContent=money(latest.amount);
          const pay=$('a[href="make-payment.html"]'); if(pay) pay.href=`make-payment.html?bill=${encodeURIComponent(latest.id)}`;
          write('gc_selected_bill_v1',latest.id);
        } else {
          const status=$('#bill-status'); if(status) status.textContent='All bills paid';
          const amount=$('#bill-amount'); if(amount) amount.textContent=money(0);
        }
      }
    }
  }

  const checkForm=$('#check-bill-form');
  if(checkForm) {
    checkForm.addEventListener('submit',async e=>{
      e.preventDefault();
      const user=currentUser(), entered=$('#meter-number').value.trim();
      const error=$('#meter-error'), billCard=$('#current-bill');
      if(error) error.hidden=true;
      const btn=$('button[type="submit"]',checkForm), old=btn?.textContent;
      if(btn){btn.disabled=true;btn.textContent='Checking…';}
      // Simulates an asynchronous API. Backend handoff: replace this lookup with fetch('api/bills.php?meter='+encodeURIComponent(entered)).
      await new Promise(resolve=>setTimeout(resolve,450));
      const owner=read(KEYS.users,[]).find(u=>u.meter===entered && u.role==='customer');
      const bill=read(KEYS.bills,[]).find(b=>b.meter===entered && b.status!=='Paid');
      if(!owner || !user || owner.email!==user.email || !bill) {
        if(error){error.textContent='No unpaid bill was found for this meter number. Check the number and try again.';error.hidden=false;}
      } else {
        $('#bill-period').textContent=bill.period; $('#bill-status').textContent=bill.status;
        $('#bill-units').textContent=`${bill.units} kWh`; $('#bill-due').textContent=bill.due; $('#bill-amount').textContent=money(bill.amount);
        const pay=$('a[href="make-payment.html"]'); if(pay) pay.href=`make-payment.html?bill=${encodeURIComponent(bill.id)}`;
        write('gc_selected_bill_v1',bill.id);
        if(billCard) billCard.scrollIntoView({behavior:'smooth',block:'start'});
      }
      if(btn){btn.disabled=false;btn.textContent=old||'Check bill';}
    });
  }

  const paymentForm=$('#payment-form');
  if(paymentForm) {
    const user=currentUser();
    let bills=read(KEYS.bills,[]);
    const selectedId=new URLSearchParams(location.search).get('bill') || read('gc_selected_bill_v1',null);
    let bill=bills.find(b=>b.id===selectedId && b.email===user?.email && b.status!=='Paid') || bills.find(b=>b.email===user?.email && b.status!=='Paid');
    if(!bill) {
      message($('#payment-message'),'There are no unpaid bills available for this account.');
      const submit=$('button[type="submit"]',paymentForm); if(submit) submit.disabled=true;
    } else {
      const summary=$$('.summary-row strong'); if(summary[0]) summary[0].textContent=bill.id;
      const amount=$$('.summary-row .big')[0]; if(amount) amount.textContent=money(bill.amount);
      const hidden=$('input[name="bill_id"]',paymentForm); if(hidden) hidden.value=bill.id;
    }
    paymentForm.addEventListener('submit',async e=>{
      e.preventDefault();
      if(!bill || !user) return;
      const submit=$('.payment-submit',paymentForm);
      const label=$('.payment-submit__label',submit);
      const spinner=$('.payment-spinner',submit);
      const error=$('#payment-message');
      const success=$('#payment-success');
      if(submit?.disabled) return;
      if(error) error.hidden=true;
      if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');}
      if(label) label.textContent='Processing payment';
      if(spinner) spinner.hidden=false;

      try {
        // Demo only: imitate a payment provider's wait. No real charge or backend request occurs.
        await new Promise(resolve=>setTimeout(resolve,1100));
        const payments=read(KEYS.payments,[]);
        const stamp=Date.now().toString().slice(-8);
        const payment={id:'TXN-'+stamp,receipt:'REC-'+stamp+'-GC',email:user.email,name:user.name,meter:user.meter,billId:bill.id,amount:bill.amount,method:$('input[name="payment_method"]:checked',paymentForm)?.value||'card',status:'Paid',date:today()};
        payments.unshift(payment);
        write(KEYS.payments,payments);
        bills=bills.map(b=>b.id===bill.id?{...b,status:'Paid'}:b);
        write(KEYS.bills,bills);
        write(KEYS.lastReceipt,payment);
        if(success) success.hidden=false;
        setTimeout(()=>{location.href='receipt.html';},1250);
      } catch (err) {
        if(error) message(error,'The demo payment could not be saved. No receipt was created. Please try again.');
        if(submit){submit.disabled=false;submit.removeAttribute('aria-busy');}
        if(label) label.textContent='Make Payment';
        if(spinner) spinner.hidden=true;
      }
    });
  }

  const receipt=read(KEYS.lastReceipt,null);
  if(path==='receipt.html' && receipt) {
    const main=$('main.panel');
    if(main) {
      const vals=$$('.receipt-amount strong, .receipt-list li span:last-child',main);
      if(vals[0]) vals[0].textContent=money(receipt.amount);
      if(vals[1]) vals[1].textContent=receipt.receipt;
      if(vals[2]) vals[2].textContent=new Date(receipt.date).toLocaleString();
      if(vals[3]) vals[3].textContent=receipt.name;
      if(vals[4]) vals[4].textContent=receipt.meter;
      if(vals[5]) vals[5].textContent=receipt.billId;
      if(vals[6]) vals[6].textContent=receipt.method==='bank_transfer'?'Bank transfer':'Card';
    }
  }

  function renderTable(tbody, rows, columns, emptyText) {
    if(!tbody) return;
    const labels=$$('thead th',tbody.closest('table')).map(th=>th.textContent.trim());
    tbody.innerHTML=rows.length?rows.map(row=>'<tr>'+columns.map((col,i)=>`<td data-label="${safe(labels[i]||`Detail ${i+1}`)}">${col(row)}</td>`).join('')+'</tr>').join(''):`<tr><td colspan="${columns.length}" class="empty-state">${safe(emptyText)}</td></tr>`;
  }
  const bills=read(KEYS.bills,[]), payments=read(KEYS.payments,[]), users=read(KEYS.users,[]);
  if(path==='previous-bills.html') {
    const user=currentUser(), own=bills.filter(b=>b.email===user?.email);
    renderTable($('tbody'),own.map(b=>({...b})),[
      b=>`<span class="strong">${safe(b.id)}</span>`,b=>safe(b.period),b=>`${safe(b.units)} kWh`,b=>`<span class="amount-cell">${money(b.amount)}</span>`,b=>safe(b.due),b=>`<span class="badge ${b.status==='Paid'?'badge--paid-green':'badge--pending'}">${safe(b.status)}</span>`
    ],'No bills found for this account.');
  }
  if(path==='transactions.html') {
    const user=currentUser(), own=payments.filter(p=>p.email===user?.email);
    renderTable($('tbody'),own,[
      p=>`<span class="strong">${safe(p.id)}</span>`,p=>safe(new Date(p.date).toLocaleDateString()),p=>safe(p.billId),p=>`<span class="amount-cell">${money(p.amount)}</span>`,p=>safe(p.method==='bank_transfer'?'Bank transfer':'Card'),p=>`<span class="badge badge--paid-green">${safe(p.status)}</span>`,p=>`<a class="btn btn--small" href="receipt.html" data-receipt="${safe(p.id)}">View receipt</a>`
    ],'No transactions yet. Your completed payments will appear here.');
    const count=$('.record-count'); if(count) count.textContent=`${own.length} record${own.length===1?'':'s'}`;
    $$('a[data-receipt]').forEach(a=>a.addEventListener('click',()=>{const p=own.find(x=>x.id===a.dataset.receipt);if(p)write(KEYS.lastReceipt,p);}));
  }

  if(path.startsWith('admin-')) {
    const admin=requireRole('admin');
    if(admin) {
      const top=$('header.topbar .user-name'); if(top) top.textContent='Administrator';
      const avatar=$('header.topbar .user-avatar'); if(avatar) avatar.textContent='AD';
      if(path==='admin-dashboard.html') {
        const stats=$$('.stat-value');
        if(stats[0]) stats[0].textContent=users.filter(u=>u.role==='customer').length;
        if(stats[1]) stats[1].textContent=bills.length;
        if(stats[2]) stats[2].textContent=money(payments.filter(p=>p.status==='Paid').reduce((s,p)=>s+p.amount,0));
        if(stats[3]) stats[3].textContent=money(bills.filter(b=>b.status!=='Paid').reduce((s,b)=>s+b.amount,0));
      }
      if(path==='admin-customers.html') {
        const search=$('input[type="search"]');
        const render=()=>{const q=(search?.value||'').toLowerCase();const list=users.filter(u=>u.role==='customer').filter(u=>[u.name,u.email,u.meter,u.phone].join(' ').toLowerCase().includes(q));
          renderTable($('tbody'),list,[u=>`<span class="dark">${safe(u.name)}</span>`,u=>safe(u.email),u=>safe(u.phone),u=>`<span class="dark strong">${safe(u.meter)}</span>`],'No customers match your search.');};
        render(); search?.addEventListener('input',render);
      }
      if(path==='admin-bills.html') {
        const search=$('input[type="search"]');
        const render=()=>{const q=(search?.value||'').toLowerCase();const list=bills.filter(b=>{const u=users.find(x=>x.email===b.email);return [b.id,b.meter,b.status,b.period,u?.name].join(' ').toLowerCase().includes(q);});
          renderTable($('tbody'),list,[b=>`<span class="link-cell">${safe(b.id)}</span>`,b=>safe(users.find(u=>u.email===b.email)?.name||'—'),b=>safe(b.meter),b=>safe(b.period),b=>`<span class="amount-cell">${money(b.amount)}</span>`,b=>`<span class="badge ${b.status==='Paid'?'badge--paid':'badge--pending'}">${safe(b.status)}</span>`],'No bills match your search.');};
        render(); search?.addEventListener('input',render);
      }
      if(path==='admin-payments.html') {
        const search=$('input[type="search"]');
        const render=()=>{const q=(search?.value||'').toLowerCase();const list=payments.filter(p=>[p.id,p.name,p.meter,p.status].join(' ').toLowerCase().includes(q));
          renderTable($('tbody'),list,[p=>`<span class="link-cell">${safe(p.id)}</span>`,p=>safe(p.name),p=>safe(p.meter),p=>`<span class="amount-cell">${money(p.amount)}</span>`,p=>safe(new Date(p.date).toLocaleDateString()),p=>`<span class="badge badge--paid-green">${safe(p.status)}</span>`],'No payments match your search.');};
        render(); search?.addEventListener('input',render);
      }
    }
  }

  // Add responsive labels to any pre-written/static table rows too (e.g. admin dashboard sample payments).
  $$('table').forEach(table=>{
    const labels=$$('thead th',table).map(th=>th.textContent.trim());
    $$('tbody tr',table).forEach(row=>$$('td',row).forEach((cell,index)=>{if(!cell.dataset.label && !cell.classList.contains('empty-state')) cell.dataset.label=labels[index]||`Detail ${index+1}`;}));
  });

  $$('form.search').forEach(form=>form.addEventListener('submit',e=>e.preventDefault()));

  // Static placeholder links should never send users to a dead # location.
  $$('a[href="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const tr=a.closest('tr'); if(tr) tr.classList.toggle('row-highlight'); else message($('.page-head'), 'This action will be connected to the backend API.','success');}));
})();
