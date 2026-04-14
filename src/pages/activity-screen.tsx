export function ActivityScreen() {
  return (
    <div style={{display:"flex", width:"100%", minHeight:"100vh", fontFamily:"Helvetica, Arial, sans-serif", backgroundColor:"#f7fcfe"}}>

      {/* ── LEFT NAV (white background) ── */}
      <div style={{width:"225px", minHeight:"100vh", backgroundColor:"#ffffff", display:"flex", flexDirection:"column", boxShadow:"0px 4px 8px 0px rgba(24,24,28,0.14), 0px 2px 4px 0px rgba(24,24,28,0.08)", flexShrink:0, zIndex:10}}>

        {/* Logo bar — blue */}
        <div style={{backgroundColor:"#0369b1", height:"60px", display:"flex", alignItems:"center", padding:"20px", flexShrink:0}}>
          <div style={{color:"#ffffff"}}>
            <span style={{fontStyle:"italic", fontWeight:700, fontSize:"16px", letterSpacing:"-0.3px"}}>PAYCHEX</span>
            <span style={{fontSize:"12px", fontWeight:500, marginLeft:"3px"}}>FLEX</span>
            <sup style={{fontSize:"8px", marginLeft:"1px"}}>®</sup>
          </div>
        </div>

        {/* Nav items */}
        <div style={{flex:1, display:"flex", flexDirection:"column"}}>

          {/* MAIN section */}
          <div style={{padding:"16px 20px 0 20px"}}>
            <div style={{fontSize:"12px", fontWeight:400, color:"#303030", letterSpacing:"0.02em", textTransform:"uppercase"}}>Main</div>
          </div>

          {/* Onboarding — active */}
          <div style={{padding:"10px 0", display:"flex", flexDirection:"column"}}>
            <div style={{display:"flex", alignItems:"center", gap:"10px", padding:"10px 20px", backgroundColor:"#f7fcfe", borderLeft:"5px solid #0369b1", cursor:"pointer"}}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 10l1.5-1.5M4.5 8.5l5.5-5.5 5.5 5.5M4.5 8.5V16a.75.75 0 00.75.75H8m8-8.25V16a.75.75 0 01-.75.75H12m-4 0v-3a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v3m-3 0h3" stroke="#0369b1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{fontSize:"14px", color:"#0369b1"}}>Onboarding</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{margin:"0 20px", borderTop:"1px solid #cacaca"}} />

          {/* OTHER section */}
          <div style={{padding:"16px 20px 0 20px"}}>
            <div style={{fontSize:"12px", fontWeight:400, color:"#303030", letterSpacing:"0.02em", textTransform:"uppercase"}}>Other</div>
          </div>

          {/* Help Center */}
          <div style={{padding:"10px 0"}}>
            <div style={{display:"flex", alignItems:"center", gap:"10px", padding:"10px 20px", cursor:"pointer"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#303030" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
              <span style={{fontSize:"14px", color:"#303030"}}>Help Center</span>
            </div>
          </div>

          <div style={{margin:"0 20px", borderTop:"1px solid #cacaca"}} />
        </div>

        {/* Bottom Legal */}
        <div style={{padding:"12px 0 10px 0", display:"flex", flexDirection:"column", alignItems:"center"}}>
          <div style={{fontSize:"12px", color:"#707070", display:"flex", gap:"4px", marginBottom:"2px"}}>
            <span>Security</span><span>|</span><span>Privacy</span>
          </div>
          <div style={{fontSize:"12px", color:"#707070", textAlign:"center"}}>Copyright © 2025 by Paychex, Inc.</div>
        </div>
      </div>

      {/* ── RIGHT CONTENT ── */}
      <div style={{flex:1, display:"flex", flexDirection:"column", minHeight:"100vh"}}>

        {/* Global Header — blue */}
        <div style={{backgroundColor:"#0369b1", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 10px", flexShrink:0}}>
          <div style={{width:"44px", height:"39px", border:"2px solid #0369b1"}} />
          <div style={{display:"flex", alignItems:"center", gap:"4px"}}>
            <div style={{width:"40px", height:"40px", display:"flex", alignItems:"center", justifyContent:"center"}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div style={{width:"40px", height:"40px", display:"flex", alignItems:"center", justifyContent:"center"}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </div>
            <div style={{width:"40px", height:"40px", display:"flex", alignItems:"center", justifyContent:"center"}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div style={{width:"52px", height:"40px", display:"flex", alignItems:"center", justifyContent:"center", gap:"2px"}}>
              <div style={{width:"32px", height:"32px", borderRadius:"50%", backgroundColor:"#e5e7eb", overflow:"hidden", border:"1px solid rgba(255,255,255,0.5)", flexShrink:0}}>
                <img src="https://placehold.co/32x32" alt="avatar" style={{width:"100%", height:"100%", objectFit:"cover"}} />
              </div>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#ffffff" strokeWidth="1.5"/></svg>
            </div>
          </div>
        </div>

        {/* Stage Header — white with company selector */}
        <div style={{backgroundColor:"#ffffff", borderBottom:"1px solid #cacaca", padding:"6px 12px", display:"flex", alignItems:"center", flexShrink:0}}>
          <div style={{display:"flex", alignItems:"center", gap:"10px", cursor:"pointer"}}>
            <div style={{width:"32px", height:"32px", backgroundColor:"#0369b1", borderRadius:"2px", display:"flex", alignItems:"center", justifyContent:"center", color:"#ffffff", fontWeight:700, fontSize:"13px", flexShrink:0}}>AC</div>
            <div>
              <div style={{fontSize:"14px", color:"#303030"}}>ACME Industrial Corp</div>
              <div style={{fontSize:"12px", color:"#707070"}}>142356747</div>
            </div>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#303030" strokeWidth="1.5"/></svg>
          </div>
        </div>

        {/* Stage content */}
        <div style={{flex:1, backgroundColor:"#f7fcfe", padding:"20px", overflowY:"auto"}}>
          <div style={{maxWidth:"650px", margin:"0 auto", display:"flex", flexDirection:"column", gap:"20px"}}>

            {/* Activities Header */}
            <div style={{borderBottom:"1px solid #cacaca", paddingBottom:"20px", display:"flex", flexDirection:"column", gap:"8px"}}>

              {/* Back button */}
              <div>
                <button style={{display:"inline-flex", alignItems:"center", gap:"6px", background:"none", border:"none", cursor:"pointer", padding:0, color:"#0369b1", fontSize:"14px"}}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10l5-5" stroke="#0369b1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Back to Onboarding
                </button>
              </div>

              {/* Icon + title + progress */}
              <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
                <div style={{width:"70px", height:"70px", backgroundColor:"#ffffff", borderRadius:"60px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                  <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                    <circle cx="15" cy="15" r="9" stroke="#566f7b" strokeWidth="1.5" fill="none"/>
                    <circle cx="27" cy="15" r="9" stroke="#566f7b" strokeWidth="1.5" fill="none"/>
                    <path d="M5 35c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#566f7b" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"20px", fontWeight:700, color:"#303030", lineHeight:"24px"}}>People setup</div>
                  <div style={{display:"flex", gap:"4px", alignItems:"center", fontSize:"16px", color:"#303030", marginTop:"6px"}}>
                    <span style={{fontWeight:700}}>75%</span>
                    <span style={{fontWeight:400}}>completed</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{position:"relative", width:"100%", height:"10px", backgroundColor:"#f7f7f7", border:"1px solid #cacaca", borderRadius:"25px", marginTop:"10px", overflow:"hidden"}}>
                    <div style={{position:"absolute", left:0, top:0, width:"75%", height:"100%", backgroundColor:"#566f7b", borderRadius:"25px"}} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks card */}
            <div style={{backgroundColor:"#ffffff", border:"1px solid #cacaca", borderRadius:"4px"}}>

              {/* Card header */}
              <div style={{padding:"20px", borderBottom:"1px solid #cacaca"}}>
                <div style={{fontSize:"16px", color:"#303030", marginBottom:"0px"}}>Let's set up your people</div>
                <div style={{fontSize:"14px", color:"#707070", lineHeight:"20px"}}>Your work is saved when you finish each task, so feel free to leave and come back later.</div>
              </div>

              {/* Task rows */}
              {[
                {label:"What to have ready",            done:true,  action:"Revisit"},
                {label:"Create pay schedule",           done:true,  action:"Revisit"},
                {label:"Provide state and local tax info", done:true, action:"Revisit"},
                {label:"Add people",                    done:false, action:"Start"},
              ].map((task, i, arr) => (
                <div key={i} style={{display:"flex", alignItems:"center", gap:"20px", padding:"28px 20px", borderBottom: i < arr.length-1 ? "1px solid #cacaca" : "none"}}>
                  {/* Status icon */}
                  <div style={{width:"23px", height:"23px", borderRadius:"50%", backgroundColor: task.done ? "#3e9136" : "#cacaca", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{flex:1, fontSize:"14px", color:"#303030", lineHeight:"20px"}}>{task.label}</span>
                  {/* Action button */}
                  {task.done ? (
                    <button style={{fontSize:"14px", color:"#0369b1", backgroundColor:"#f7fcfe", border:"1px solid transparent", borderRadius:"4px", padding:"9px 17px", cursor:"pointer", whiteSpace:"nowrap"}}>
                      {task.action}
                    </button>
                  ) : (
                    <button style={{fontSize:"14px", color:"#0369b1", backgroundColor:"#ffffff", border:"1px solid #0369b1", borderRadius:"4px", padding:"9px 17px", cursor:"pointer", whiteSpace:"nowrap"}}>
                      {task.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Help footer */}
          <div style={{maxWidth:"430px", margin:"40px auto 0 auto"}}>
            <div style={{borderTop:"1px solid #cacaca", paddingTop:"40px", display:"flex", justifyContent:"center"}}>
              <div style={{backgroundColor:"#ffffff", border:"1px solid #cacaca", borderRadius:"4px", padding:"16px 20px", display:"flex", alignItems:"center", gap:"8px", width:"100%"}}>
                <div style={{width:"32px", height:"32px", flexShrink:0, position:"relative"}}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M5 6h18a2 2 0 012 2v12a2 2 0 01-2 2H9l-6 6V8a2 2 0 012-2z" stroke="#f97316" strokeWidth="1.5" fill="none"/>
                    <circle cx="16" cy="13" r="2" fill="#f97316"/>
                  </svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"14px", fontWeight:700, color:"#303030", lineHeight:"20px"}}>Title</div>
                  <button style={{fontSize:"14px", color:"#0369b1", background:"none", border:"none", padding:0, cursor:"pointer", lineHeight:"20px"}}>Try our chatbot for help</button>
                </div>
                <button style={{fontSize:"14px", color:"#0369b1", backgroundColor:"#ffffff", border:"1px solid #0369b1", borderRadius:"3px", padding:"8px 16px", cursor:"pointer", whiteSpace:"nowrap"}}>
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help button — fixed bottom right */}
      <div style={{position:"fixed", bottom:"20px", right:"20px", width:"40px", height:"40px", backgroundColor:"#0056a0", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
        <span style={{color:"#ffffff", fontWeight:700, fontSize:"18px", lineHeight:1}}>?</span>
      </div>
    </div>
  );
}
