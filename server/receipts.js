export const received = i => Array.isArray(i.parts) ? i.parts.reduce((n,p)=>n+p.amt,0) : i.paid ? i.amt : 0;
export const outstanding = i => Math.max(0,i.amt-received(i));
