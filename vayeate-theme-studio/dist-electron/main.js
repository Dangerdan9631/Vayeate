import { app as G, ipcMain as Q, BrowserWindow as rn } from "electron";
import { join as re, dirname as Wn } from "node:path";
import { fileURLToPath as Gn } from "node:url";
import { readdir as Bn, readFile as Kn, mkdir as Xn, writeFile as Yn } from "node:fs/promises";
function a(e, n, t) {
  function r(c, u) {
    if (c._zod || Object.defineProperty(c, "_zod", {
      value: {
        def: u,
        constr: s,
        traits: /* @__PURE__ */ new Set()
      },
      enumerable: !1
    }), c._zod.traits.has(e))
      return;
    c._zod.traits.add(e), n(c, u);
    const l = s.prototype, f = Object.keys(l);
    for (let d = 0; d < f.length; d++) {
      const m = f[d];
      m in c || (c[m] = l[m].bind(c));
    }
  }
  const o = (t == null ? void 0 : t.Parent) ?? Object;
  class i extends o {
  }
  Object.defineProperty(i, "name", { value: e });
  function s(c) {
    var u;
    const l = t != null && t.Parent ? new i() : this;
    r(l, c), (u = l._zod).deferred ?? (u.deferred = []);
    for (const f of l._zod.deferred)
      f();
    return l;
  }
  return Object.defineProperty(s, "init", { value: r }), Object.defineProperty(s, Symbol.hasInstance, {
    value: (c) => {
      var u, l;
      return t != null && t.Parent && c instanceof t.Parent ? !0 : (l = (u = c == null ? void 0 : c._zod) == null ? void 0 : u.traits) == null ? void 0 : l.has(e);
    }
  }), Object.defineProperty(s, "name", { value: e }), s;
}
class J extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class on extends Error {
  constructor(n) {
    super(`Encountered unidirectional transform during encode: ${n}`), this.name = "ZodEncodeError";
  }
}
const sn = {};
function D(e) {
  return sn;
}
function cn(e) {
  const n = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e).filter(([r, o]) => n.indexOf(+r) === -1).map(([r, o]) => o);
}
function _e(e, n) {
  return typeof n == "bigint" ? n.toString() : n;
}
function ye(e) {
  return {
    get value() {
      {
        const n = e();
        return Object.defineProperty(this, "value", { value: n }), n;
      }
    }
  };
}
function ze(e) {
  return e == null;
}
function be(e) {
  const n = e.startsWith("^") ? 1 : 0, t = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(n, t);
}
function qn(e, n) {
  const t = (e.toString().split(".")[1] || "").length, r = n.toString();
  let o = (r.split(".")[1] || "").length;
  if (o === 0 && /\d?e-\d?/.test(r)) {
    const u = r.match(/\d?e-(\d?)/);
    u != null && u[1] && (o = Number.parseInt(u[1]));
  }
  const i = t > o ? t : o, s = Number.parseInt(e.toFixed(i).replace(".", "")), c = Number.parseInt(n.toFixed(i).replace(".", ""));
  return s % c / 10 ** i;
}
const Ie = Symbol("evaluating");
function g(e, n, t) {
  let r;
  Object.defineProperty(e, n, {
    get() {
      if (r !== Ie)
        return r === void 0 && (r = Ie, r = t()), r;
    },
    set(o) {
      Object.defineProperty(e, n, {
        value: o
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function U(e, n, t) {
  Object.defineProperty(e, n, {
    value: t,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function R(...e) {
  const n = {};
  for (const t of e) {
    const r = Object.getOwnPropertyDescriptors(t);
    Object.assign(n, r);
  }
  return Object.defineProperties({}, n);
}
function Te(e) {
  return JSON.stringify(e);
}
function Hn(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const un = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function oe(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const Qn = ye(() => {
  var e;
  if (typeof navigator < "u" && ((e = navigator == null ? void 0 : navigator.userAgent) != null && e.includes("Cloudflare")))
    return !1;
  try {
    const n = Function;
    return new n(""), !0;
  } catch {
    return !1;
  }
});
function B(e) {
  if (oe(e) === !1)
    return !1;
  const n = e.constructor;
  if (n === void 0 || typeof n != "function")
    return !0;
  const t = n.prototype;
  return !(oe(t) === !1 || Object.prototype.hasOwnProperty.call(t, "isPrototypeOf") === !1);
}
function an(e) {
  return B(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const et = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function ue(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function C(e, n, t) {
  const r = new e._zod.constr(n ?? e._zod.def);
  return (!n || t != null && t.parent) && (r._zod.parent = e), r;
}
function p(e) {
  const n = e;
  if (!n)
    return {};
  if (typeof n == "string")
    return { error: () => n };
  if ((n == null ? void 0 : n.message) !== void 0) {
    if ((n == null ? void 0 : n.error) !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    n.error = n.message;
  }
  return delete n.message, typeof n.error == "string" ? { ...n, error: () => n.error } : n;
}
function nt(e) {
  return Object.keys(e).filter((n) => e[n]._zod.optin === "optional" && e[n]._zod.optout === "optional");
}
const tt = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function rt(e, n) {
  const t = e._zod.def, r = t.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = R(e._zod.def, {
    get shape() {
      const s = {};
      for (const c in n) {
        if (!(c in t.shape))
          throw new Error(`Unrecognized key: "${c}"`);
        n[c] && (s[c] = t.shape[c]);
      }
      return U(this, "shape", s), s;
    },
    checks: []
  });
  return C(e, i);
}
function ot(e, n) {
  const t = e._zod.def, r = t.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = R(e._zod.def, {
    get shape() {
      const s = { ...e._zod.def.shape };
      for (const c in n) {
        if (!(c in t.shape))
          throw new Error(`Unrecognized key: "${c}"`);
        n[c] && delete s[c];
      }
      return U(this, "shape", s), s;
    },
    checks: []
  });
  return C(e, i);
}
function it(e, n) {
  if (!B(n))
    throw new Error("Invalid input to extend: expected a plain object");
  const t = e._zod.def.checks;
  if (t && t.length > 0) {
    const i = e._zod.def.shape;
    for (const s in n)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const o = R(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape, ...n };
      return U(this, "shape", i), i;
    }
  });
  return C(e, o);
}
function st(e, n) {
  if (!B(n))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const t = R(e._zod.def, {
    get shape() {
      const r = { ...e._zod.def.shape, ...n };
      return U(this, "shape", r), r;
    }
  });
  return C(e, t);
}
function ct(e, n) {
  const t = R(e._zod.def, {
    get shape() {
      const r = { ...e._zod.def.shape, ...n._zod.def.shape };
      return U(this, "shape", r), r;
    },
    get catchall() {
      return n._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return C(e, t);
}
function ut(e, n, t) {
  const o = n._zod.def.checks;
  if (o && o.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const s = R(n._zod.def, {
    get shape() {
      const c = n._zod.def.shape, u = { ...c };
      if (t)
        for (const l in t) {
          if (!(l in c))
            throw new Error(`Unrecognized key: "${l}"`);
          t[l] && (u[l] = e ? new e({
            type: "optional",
            innerType: c[l]
          }) : c[l]);
        }
      else
        for (const l in c)
          u[l] = e ? new e({
            type: "optional",
            innerType: c[l]
          }) : c[l];
      return U(this, "shape", u), u;
    },
    checks: []
  });
  return C(n, s);
}
function at(e, n, t) {
  const r = R(n._zod.def, {
    get shape() {
      const o = n._zod.def.shape, i = { ...o };
      if (t)
        for (const s in t) {
          if (!(s in i))
            throw new Error(`Unrecognized key: "${s}"`);
          t[s] && (i[s] = new e({
            type: "nonoptional",
            innerType: o[s]
          }));
        }
      else
        for (const s in o)
          i[s] = new e({
            type: "nonoptional",
            innerType: o[s]
          });
      return U(this, "shape", i), i;
    }
  });
  return C(n, r);
}
function x(e, n = 0) {
  var t;
  if (e.aborted === !0)
    return !0;
  for (let r = n; r < e.issues.length; r++)
    if (((t = e.issues[r]) == null ? void 0 : t.continue) !== !0)
      return !0;
  return !1;
}
function ln(e, n) {
  return n.map((t) => {
    var r;
    return (r = t).path ?? (r.path = []), t.path.unshift(e), t;
  });
}
function ee(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function F(e, n, t) {
  var o, i, s, c, u, l;
  const r = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const f = ee((s = (i = (o = e.inst) == null ? void 0 : o._zod.def) == null ? void 0 : i.error) == null ? void 0 : s.call(i, e)) ?? ee((c = n == null ? void 0 : n.error) == null ? void 0 : c.call(n, e)) ?? ee((u = t.customError) == null ? void 0 : u.call(t, e)) ?? ee((l = t.localeError) == null ? void 0 : l.call(t, e)) ?? "Invalid input";
    r.message = f;
  }
  return delete r.inst, delete r.continue, n != null && n.reportInput || delete r.input, r;
}
function we(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function K(...e) {
  const [n, t, r] = e;
  return typeof n == "string" ? {
    message: n,
    code: "custom",
    input: t,
    inst: r
  } : { ...n };
}
const fn = (e, n) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: n,
    enumerable: !1
  }), e.message = JSON.stringify(n, _e, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, dn = a("$ZodError", fn), pn = a("$ZodError", fn, { Parent: Error });
function lt(e, n = (t) => t.message) {
  const t = {}, r = [];
  for (const o of e.issues)
    o.path.length > 0 ? (t[o.path[0]] = t[o.path[0]] || [], t[o.path[0]].push(n(o))) : r.push(n(o));
  return { formErrors: r, fieldErrors: t };
}
function ft(e, n = (t) => t.message) {
  const t = { _errors: [] }, r = (o) => {
    for (const i of o.issues)
      if (i.code === "invalid_union" && i.errors.length)
        i.errors.map((s) => r({ issues: s }));
      else if (i.code === "invalid_key")
        r({ issues: i.issues });
      else if (i.code === "invalid_element")
        r({ issues: i.issues });
      else if (i.path.length === 0)
        t._errors.push(n(i));
      else {
        let s = t, c = 0;
        for (; c < i.path.length; ) {
          const u = i.path[c];
          c === i.path.length - 1 ? (s[u] = s[u] || { _errors: [] }, s[u]._errors.push(n(i))) : s[u] = s[u] || { _errors: [] }, s = s[u], c++;
        }
      }
  };
  return r(e), t;
}
const ke = (e) => (n, t, r, o) => {
  const i = r ? Object.assign(r, { async: !1 }) : { async: !1 }, s = n._zod.run({ value: t, issues: [] }, i);
  if (s instanceof Promise)
    throw new J();
  if (s.issues.length) {
    const c = new ((o == null ? void 0 : o.Err) ?? e)(s.issues.map((u) => F(u, i, D())));
    throw un(c, o == null ? void 0 : o.callee), c;
  }
  return s.value;
}, $e = (e) => async (n, t, r, o) => {
  const i = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let s = n._zod.run({ value: t, issues: [] }, i);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const c = new ((o == null ? void 0 : o.Err) ?? e)(s.issues.map((u) => F(u, i, D())));
    throw un(c, o == null ? void 0 : o.callee), c;
  }
  return s.value;
}, ae = (e) => (n, t, r) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, i = n._zod.run({ value: t, issues: [] }, o);
  if (i instanceof Promise)
    throw new J();
  return i.issues.length ? {
    success: !1,
    error: new (e ?? dn)(i.issues.map((s) => F(s, o, D())))
  } : { success: !0, data: i.value };
}, dt = /* @__PURE__ */ ae(pn), le = (e) => async (n, t, r) => {
  const o = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let i = n._zod.run({ value: t, issues: [] }, o);
  return i instanceof Promise && (i = await i), i.issues.length ? {
    success: !1,
    error: new e(i.issues.map((s) => F(s, o, D())))
  } : { success: !0, data: i.value };
}, pt = /* @__PURE__ */ le(pn), ht = (e) => (n, t, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return ke(e)(n, t, o);
}, mt = (e) => (n, t, r) => ke(e)(n, t, r), _t = (e) => async (n, t, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return $e(e)(n, t, o);
}, gt = (e) => async (n, t, r) => $e(e)(n, t, r), vt = (e) => (n, t, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return ae(e)(n, t, o);
}, yt = (e) => (n, t, r) => ae(e)(n, t, r), zt = (e) => async (n, t, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return le(e)(n, t, o);
}, bt = (e) => async (n, t, r) => le(e)(n, t, r), wt = /^[cC][^\s-]{8,}$/, kt = /^[0-9a-z]+$/, $t = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, Zt = /^[0-9a-vA-V]{20}$/, St = /^[A-Za-z0-9]{27}$/, Ot = /^[a-zA-Z0-9_-]{21}$/, Et = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, It = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Pe = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, Tt = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Pt = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function Nt() {
  return new RegExp(Pt, "u");
}
const At = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, jt = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Rt = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Ct = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Dt = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, hn = /^[A-Za-z0-9_-]*$/, Ft = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, Ut = /^\+[1-9]\d{6,14}$/, mn = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", xt = /* @__PURE__ */ new RegExp(`^${mn}$`);
function _n(e) {
  const n = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${n}` : e.precision === 0 ? `${n}:[0-5]\\d` : `${n}:[0-5]\\d\\.\\d{${e.precision}}` : `${n}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Jt(e) {
  return new RegExp(`^${_n(e)}$`);
}
function Lt(e) {
  const n = _n({ precision: e.precision }), t = ["Z"];
  e.local && t.push(""), e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const r = `${n}(?:${t.join("|")})`;
  return new RegExp(`^${mn}T(?:${r})$`);
}
const Mt = (e) => {
  const n = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${n}$`);
}, Vt = /^-?\d+$/, Wt = /^-?\d+(?:\.\d+)?$/, Gt = /^(?:true|false)$/i, Bt = /^[^A-Z]*$/, Kt = /^[^a-z]*$/, E = /* @__PURE__ */ a("$ZodCheck", (e, n) => {
  var t;
  e._zod ?? (e._zod = {}), e._zod.def = n, (t = e._zod).onattach ?? (t.onattach = []);
}), gn = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, vn = /* @__PURE__ */ a("$ZodCheckLessThan", (e, n) => {
  E.init(e, n);
  const t = gn[typeof n.value];
  e._zod.onattach.push((r) => {
    const o = r._zod.bag, i = (n.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    n.value < i && (n.inclusive ? o.maximum = n.value : o.exclusiveMaximum = n.value);
  }), e._zod.check = (r) => {
    (n.inclusive ? r.value <= n.value : r.value < n.value) || r.issues.push({
      origin: t,
      code: "too_big",
      maximum: typeof n.value == "object" ? n.value.getTime() : n.value,
      input: r.value,
      inclusive: n.inclusive,
      inst: e,
      continue: !n.abort
    });
  };
}), yn = /* @__PURE__ */ a("$ZodCheckGreaterThan", (e, n) => {
  E.init(e, n);
  const t = gn[typeof n.value];
  e._zod.onattach.push((r) => {
    const o = r._zod.bag, i = (n.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    n.value > i && (n.inclusive ? o.minimum = n.value : o.exclusiveMinimum = n.value);
  }), e._zod.check = (r) => {
    (n.inclusive ? r.value >= n.value : r.value > n.value) || r.issues.push({
      origin: t,
      code: "too_small",
      minimum: typeof n.value == "object" ? n.value.getTime() : n.value,
      input: r.value,
      inclusive: n.inclusive,
      inst: e,
      continue: !n.abort
    });
  };
}), Xt = /* @__PURE__ */ a("$ZodCheckMultipleOf", (e, n) => {
  E.init(e, n), e._zod.onattach.push((t) => {
    var r;
    (r = t._zod.bag).multipleOf ?? (r.multipleOf = n.value);
  }), e._zod.check = (t) => {
    if (typeof t.value != typeof n.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof t.value == "bigint" ? t.value % n.value === BigInt(0) : qn(t.value, n.value) === 0) || t.issues.push({
      origin: typeof t.value,
      code: "not_multiple_of",
      divisor: n.value,
      input: t.value,
      inst: e,
      continue: !n.abort
    });
  };
}), Yt = /* @__PURE__ */ a("$ZodCheckNumberFormat", (e, n) => {
  var s;
  E.init(e, n), n.format = n.format || "float64";
  const t = (s = n.format) == null ? void 0 : s.includes("int"), r = t ? "int" : "number", [o, i] = tt[n.format];
  e._zod.onattach.push((c) => {
    const u = c._zod.bag;
    u.format = n.format, u.minimum = o, u.maximum = i, t && (u.pattern = Vt);
  }), e._zod.check = (c) => {
    const u = c.value;
    if (t) {
      if (!Number.isInteger(u)) {
        c.issues.push({
          expected: r,
          format: n.format,
          code: "invalid_type",
          continue: !1,
          input: u,
          inst: e
        });
        return;
      }
      if (!Number.isSafeInteger(u)) {
        u > 0 ? c.issues.push({
          input: u,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !n.abort
        }) : c.issues.push({
          input: u,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !n.abort
        });
        return;
      }
    }
    u < o && c.issues.push({
      origin: "number",
      input: u,
      code: "too_small",
      minimum: o,
      inclusive: !0,
      inst: e,
      continue: !n.abort
    }), u > i && c.issues.push({
      origin: "number",
      input: u,
      code: "too_big",
      maximum: i,
      inclusive: !0,
      inst: e,
      continue: !n.abort
    });
  };
}), qt = /* @__PURE__ */ a("$ZodCheckMaxLength", (e, n) => {
  var t;
  E.init(e, n), (t = e._zod.def).when ?? (t.when = (r) => {
    const o = r.value;
    return !ze(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    n.maximum < o && (r._zod.bag.maximum = n.maximum);
  }), e._zod.check = (r) => {
    const o = r.value;
    if (o.length <= n.maximum)
      return;
    const s = we(o);
    r.issues.push({
      origin: s,
      code: "too_big",
      maximum: n.maximum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !n.abort
    });
  };
}), Ht = /* @__PURE__ */ a("$ZodCheckMinLength", (e, n) => {
  var t;
  E.init(e, n), (t = e._zod.def).when ?? (t.when = (r) => {
    const o = r.value;
    return !ze(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    n.minimum > o && (r._zod.bag.minimum = n.minimum);
  }), e._zod.check = (r) => {
    const o = r.value;
    if (o.length >= n.minimum)
      return;
    const s = we(o);
    r.issues.push({
      origin: s,
      code: "too_small",
      minimum: n.minimum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !n.abort
    });
  };
}), Qt = /* @__PURE__ */ a("$ZodCheckLengthEquals", (e, n) => {
  var t;
  E.init(e, n), (t = e._zod.def).when ?? (t.when = (r) => {
    const o = r.value;
    return !ze(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.minimum = n.length, o.maximum = n.length, o.length = n.length;
  }), e._zod.check = (r) => {
    const o = r.value, i = o.length;
    if (i === n.length)
      return;
    const s = we(o), c = i > n.length;
    r.issues.push({
      origin: s,
      ...c ? { code: "too_big", maximum: n.length } : { code: "too_small", minimum: n.length },
      inclusive: !0,
      exact: !0,
      input: r.value,
      inst: e,
      continue: !n.abort
    });
  };
}), fe = /* @__PURE__ */ a("$ZodCheckStringFormat", (e, n) => {
  var t, r;
  E.init(e, n), e._zod.onattach.push((o) => {
    const i = o._zod.bag;
    i.format = n.format, n.pattern && (i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(n.pattern));
  }), n.pattern ? (t = e._zod).check ?? (t.check = (o) => {
    n.pattern.lastIndex = 0, !n.pattern.test(o.value) && o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: n.format,
      input: o.value,
      ...n.pattern ? { pattern: n.pattern.toString() } : {},
      inst: e,
      continue: !n.abort
    });
  }) : (r = e._zod).check ?? (r.check = () => {
  });
}), er = /* @__PURE__ */ a("$ZodCheckRegex", (e, n) => {
  fe.init(e, n), e._zod.check = (t) => {
    n.pattern.lastIndex = 0, !n.pattern.test(t.value) && t.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: t.value,
      pattern: n.pattern.toString(),
      inst: e,
      continue: !n.abort
    });
  };
}), nr = /* @__PURE__ */ a("$ZodCheckLowerCase", (e, n) => {
  n.pattern ?? (n.pattern = Bt), fe.init(e, n);
}), tr = /* @__PURE__ */ a("$ZodCheckUpperCase", (e, n) => {
  n.pattern ?? (n.pattern = Kt), fe.init(e, n);
}), rr = /* @__PURE__ */ a("$ZodCheckIncludes", (e, n) => {
  E.init(e, n);
  const t = ue(n.includes), r = new RegExp(typeof n.position == "number" ? `^.{${n.position}}${t}` : t);
  n.pattern = r, e._zod.onattach.push((o) => {
    const i = o._zod.bag;
    i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(r);
  }), e._zod.check = (o) => {
    o.value.includes(n.includes, n.position) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: n.includes,
      input: o.value,
      inst: e,
      continue: !n.abort
    });
  };
}), or = /* @__PURE__ */ a("$ZodCheckStartsWith", (e, n) => {
  E.init(e, n);
  const t = new RegExp(`^${ue(n.prefix)}.*`);
  n.pattern ?? (n.pattern = t), e._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(t);
  }), e._zod.check = (r) => {
    r.value.startsWith(n.prefix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: n.prefix,
      input: r.value,
      inst: e,
      continue: !n.abort
    });
  };
}), ir = /* @__PURE__ */ a("$ZodCheckEndsWith", (e, n) => {
  E.init(e, n);
  const t = new RegExp(`.*${ue(n.suffix)}$`);
  n.pattern ?? (n.pattern = t), e._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(t);
  }), e._zod.check = (r) => {
    r.value.endsWith(n.suffix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: n.suffix,
      input: r.value,
      inst: e,
      continue: !n.abort
    });
  };
}), sr = /* @__PURE__ */ a("$ZodCheckOverwrite", (e, n) => {
  E.init(e, n), e._zod.check = (t) => {
    t.value = n.tx(t.value);
  };
});
class cr {
  constructor(n = []) {
    this.content = [], this.indent = 0, this && (this.args = n);
  }
  indented(n) {
    this.indent += 1, n(this), this.indent -= 1;
  }
  write(n) {
    if (typeof n == "function") {
      n(this, { execution: "sync" }), n(this, { execution: "async" });
      return;
    }
    const r = n.split(`
`).filter((s) => s), o = Math.min(...r.map((s) => s.length - s.trimStart().length)), i = r.map((s) => s.slice(o)).map((s) => " ".repeat(this.indent * 2) + s);
    for (const s of i)
      this.content.push(s);
  }
  compile() {
    const n = Function, t = this == null ? void 0 : this.args, o = [...((this == null ? void 0 : this.content) ?? [""]).map((i) => `  ${i}`)];
    return new n(...t, o.join(`
`));
  }
}
const ur = {
  major: 4,
  minor: 3,
  patch: 6
}, b = /* @__PURE__ */ a("$ZodType", (e, n) => {
  var o;
  var t;
  e ?? (e = {}), e._zod.def = n, e._zod.bag = e._zod.bag || {}, e._zod.version = ur;
  const r = [...e._zod.def.checks ?? []];
  e._zod.traits.has("$ZodCheck") && r.unshift(e);
  for (const i of r)
    for (const s of i._zod.onattach)
      s(e);
  if (r.length === 0)
    (t = e._zod).deferred ?? (t.deferred = []), (o = e._zod.deferred) == null || o.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const i = (c, u, l) => {
      let f = x(c), d;
      for (const m of u) {
        if (m._zod.def.when) {
          if (!m._zod.def.when(c))
            continue;
        } else if (f)
          continue;
        const h = c.issues.length, v = m._zod.check(c);
        if (v instanceof Promise && (l == null ? void 0 : l.async) === !1)
          throw new J();
        if (d || v instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await v, c.issues.length !== h && (f || (f = x(c, h)));
          });
        else {
          if (c.issues.length === h)
            continue;
          f || (f = x(c, h));
        }
      }
      return d ? d.then(() => c) : c;
    }, s = (c, u, l) => {
      if (x(c))
        return c.aborted = !0, c;
      const f = i(u, r, l);
      if (f instanceof Promise) {
        if (l.async === !1)
          throw new J();
        return f.then((d) => e._zod.parse(d, l));
      }
      return e._zod.parse(f, l);
    };
    e._zod.run = (c, u) => {
      if (u.skipChecks)
        return e._zod.parse(c, u);
      if (u.direction === "backward") {
        const f = e._zod.parse({ value: c.value, issues: [] }, { ...u, skipChecks: !0 });
        return f instanceof Promise ? f.then((d) => s(d, c, u)) : s(f, c, u);
      }
      const l = e._zod.parse(c, u);
      if (l instanceof Promise) {
        if (u.async === !1)
          throw new J();
        return l.then((f) => i(f, r, u));
      }
      return i(l, r, u);
    };
  }
  g(e, "~standard", () => ({
    validate: (i) => {
      var s;
      try {
        const c = dt(e, i);
        return c.success ? { value: c.data } : { issues: (s = c.error) == null ? void 0 : s.issues };
      } catch {
        return pt(e, i).then((u) => {
          var l;
          return u.success ? { value: u.data } : { issues: (l = u.error) == null ? void 0 : l.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), Ze = /* @__PURE__ */ a("$ZodString", (e, n) => {
  var t;
  b.init(e, n), e._zod.pattern = [...((t = e == null ? void 0 : e._zod.bag) == null ? void 0 : t.patterns) ?? []].pop() ?? Mt(e._zod.bag), e._zod.parse = (r, o) => {
    if (n.coerce)
      try {
        r.value = String(r.value);
      } catch {
      }
    return typeof r.value == "string" || r.issues.push({
      expected: "string",
      code: "invalid_type",
      input: r.value,
      inst: e
    }), r;
  };
}), y = /* @__PURE__ */ a("$ZodStringFormat", (e, n) => {
  fe.init(e, n), Ze.init(e, n);
}), ar = /* @__PURE__ */ a("$ZodGUID", (e, n) => {
  n.pattern ?? (n.pattern = It), y.init(e, n);
}), lr = /* @__PURE__ */ a("$ZodUUID", (e, n) => {
  if (n.version) {
    const r = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[n.version];
    if (r === void 0)
      throw new Error(`Invalid UUID version: "${n.version}"`);
    n.pattern ?? (n.pattern = Pe(r));
  } else
    n.pattern ?? (n.pattern = Pe());
  y.init(e, n);
}), fr = /* @__PURE__ */ a("$ZodEmail", (e, n) => {
  n.pattern ?? (n.pattern = Tt), y.init(e, n);
}), dr = /* @__PURE__ */ a("$ZodURL", (e, n) => {
  y.init(e, n), e._zod.check = (t) => {
    try {
      const r = t.value.trim(), o = new URL(r);
      n.hostname && (n.hostname.lastIndex = 0, n.hostname.test(o.hostname) || t.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: n.hostname.source,
        input: t.value,
        inst: e,
        continue: !n.abort
      })), n.protocol && (n.protocol.lastIndex = 0, n.protocol.test(o.protocol.endsWith(":") ? o.protocol.slice(0, -1) : o.protocol) || t.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: n.protocol.source,
        input: t.value,
        inst: e,
        continue: !n.abort
      })), n.normalize ? t.value = o.href : t.value = r;
      return;
    } catch {
      t.issues.push({
        code: "invalid_format",
        format: "url",
        input: t.value,
        inst: e,
        continue: !n.abort
      });
    }
  };
}), pr = /* @__PURE__ */ a("$ZodEmoji", (e, n) => {
  n.pattern ?? (n.pattern = Nt()), y.init(e, n);
}), hr = /* @__PURE__ */ a("$ZodNanoID", (e, n) => {
  n.pattern ?? (n.pattern = Ot), y.init(e, n);
}), mr = /* @__PURE__ */ a("$ZodCUID", (e, n) => {
  n.pattern ?? (n.pattern = wt), y.init(e, n);
}), _r = /* @__PURE__ */ a("$ZodCUID2", (e, n) => {
  n.pattern ?? (n.pattern = kt), y.init(e, n);
}), gr = /* @__PURE__ */ a("$ZodULID", (e, n) => {
  n.pattern ?? (n.pattern = $t), y.init(e, n);
}), vr = /* @__PURE__ */ a("$ZodXID", (e, n) => {
  n.pattern ?? (n.pattern = Zt), y.init(e, n);
}), yr = /* @__PURE__ */ a("$ZodKSUID", (e, n) => {
  n.pattern ?? (n.pattern = St), y.init(e, n);
}), zr = /* @__PURE__ */ a("$ZodISODateTime", (e, n) => {
  n.pattern ?? (n.pattern = Lt(n)), y.init(e, n);
}), br = /* @__PURE__ */ a("$ZodISODate", (e, n) => {
  n.pattern ?? (n.pattern = xt), y.init(e, n);
}), wr = /* @__PURE__ */ a("$ZodISOTime", (e, n) => {
  n.pattern ?? (n.pattern = Jt(n)), y.init(e, n);
}), kr = /* @__PURE__ */ a("$ZodISODuration", (e, n) => {
  n.pattern ?? (n.pattern = Et), y.init(e, n);
}), $r = /* @__PURE__ */ a("$ZodIPv4", (e, n) => {
  n.pattern ?? (n.pattern = At), y.init(e, n), e._zod.bag.format = "ipv4";
}), Zr = /* @__PURE__ */ a("$ZodIPv6", (e, n) => {
  n.pattern ?? (n.pattern = jt), y.init(e, n), e._zod.bag.format = "ipv6", e._zod.check = (t) => {
    try {
      new URL(`http://[${t.value}]`);
    } catch {
      t.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: t.value,
        inst: e,
        continue: !n.abort
      });
    }
  };
}), Sr = /* @__PURE__ */ a("$ZodCIDRv4", (e, n) => {
  n.pattern ?? (n.pattern = Rt), y.init(e, n);
}), Or = /* @__PURE__ */ a("$ZodCIDRv6", (e, n) => {
  n.pattern ?? (n.pattern = Ct), y.init(e, n), e._zod.check = (t) => {
    const r = t.value.split("/");
    try {
      if (r.length !== 2)
        throw new Error();
      const [o, i] = r;
      if (!i)
        throw new Error();
      const s = Number(i);
      if (`${s}` !== i)
        throw new Error();
      if (s < 0 || s > 128)
        throw new Error();
      new URL(`http://[${o}]`);
    } catch {
      t.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: t.value,
        inst: e,
        continue: !n.abort
      });
    }
  };
});
function zn(e) {
  if (e === "")
    return !0;
  if (e.length % 4 !== 0)
    return !1;
  try {
    return atob(e), !0;
  } catch {
    return !1;
  }
}
const Er = /* @__PURE__ */ a("$ZodBase64", (e, n) => {
  n.pattern ?? (n.pattern = Dt), y.init(e, n), e._zod.bag.contentEncoding = "base64", e._zod.check = (t) => {
    zn(t.value) || t.issues.push({
      code: "invalid_format",
      format: "base64",
      input: t.value,
      inst: e,
      continue: !n.abort
    });
  };
});
function Ir(e) {
  if (!hn.test(e))
    return !1;
  const n = e.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), t = n.padEnd(Math.ceil(n.length / 4) * 4, "=");
  return zn(t);
}
const Tr = /* @__PURE__ */ a("$ZodBase64URL", (e, n) => {
  n.pattern ?? (n.pattern = hn), y.init(e, n), e._zod.bag.contentEncoding = "base64url", e._zod.check = (t) => {
    Ir(t.value) || t.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: t.value,
      inst: e,
      continue: !n.abort
    });
  };
}), Pr = /* @__PURE__ */ a("$ZodE164", (e, n) => {
  n.pattern ?? (n.pattern = Ut), y.init(e, n);
});
function Nr(e, n = null) {
  try {
    const t = e.split(".");
    if (t.length !== 3)
      return !1;
    const [r] = t;
    if (!r)
      return !1;
    const o = JSON.parse(atob(r));
    return !("typ" in o && (o == null ? void 0 : o.typ) !== "JWT" || !o.alg || n && (!("alg" in o) || o.alg !== n));
  } catch {
    return !1;
  }
}
const Ar = /* @__PURE__ */ a("$ZodJWT", (e, n) => {
  y.init(e, n), e._zod.check = (t) => {
    Nr(t.value, n.alg) || t.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: t.value,
      inst: e,
      continue: !n.abort
    });
  };
}), bn = /* @__PURE__ */ a("$ZodNumber", (e, n) => {
  b.init(e, n), e._zod.pattern = e._zod.bag.pattern ?? Wt, e._zod.parse = (t, r) => {
    if (n.coerce)
      try {
        t.value = Number(t.value);
      } catch {
      }
    const o = t.value;
    if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o))
      return t;
    const i = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : "Infinity" : void 0;
    return t.issues.push({
      expected: "number",
      code: "invalid_type",
      input: o,
      inst: e,
      ...i ? { received: i } : {}
    }), t;
  };
}), jr = /* @__PURE__ */ a("$ZodNumberFormat", (e, n) => {
  Yt.init(e, n), bn.init(e, n);
}), Rr = /* @__PURE__ */ a("$ZodBoolean", (e, n) => {
  b.init(e, n), e._zod.pattern = Gt, e._zod.parse = (t, r) => {
    if (n.coerce)
      try {
        t.value = !!t.value;
      } catch {
      }
    const o = t.value;
    return typeof o == "boolean" || t.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: o,
      inst: e
    }), t;
  };
}), Cr = /* @__PURE__ */ a("$ZodUnknown", (e, n) => {
  b.init(e, n), e._zod.parse = (t) => t;
}), Dr = /* @__PURE__ */ a("$ZodNever", (e, n) => {
  b.init(e, n), e._zod.parse = (t, r) => (t.issues.push({
    expected: "never",
    code: "invalid_type",
    input: t.value,
    inst: e
  }), t);
});
function Ne(e, n, t) {
  e.issues.length && n.issues.push(...ln(t, e.issues)), n.value[t] = e.value;
}
const Fr = /* @__PURE__ */ a("$ZodArray", (e, n) => {
  b.init(e, n), e._zod.parse = (t, r) => {
    const o = t.value;
    if (!Array.isArray(o))
      return t.issues.push({
        expected: "array",
        code: "invalid_type",
        input: o,
        inst: e
      }), t;
    t.value = Array(o.length);
    const i = [];
    for (let s = 0; s < o.length; s++) {
      const c = o[s], u = n.element._zod.run({
        value: c,
        issues: []
      }, r);
      u instanceof Promise ? i.push(u.then((l) => Ne(l, t, s))) : Ne(u, t, s);
    }
    return i.length ? Promise.all(i).then(() => t) : t;
  };
});
function ie(e, n, t, r, o) {
  if (e.issues.length) {
    if (o && !(t in r))
      return;
    n.issues.push(...ln(t, e.issues));
  }
  e.value === void 0 ? t in r && (n.value[t] = void 0) : n.value[t] = e.value;
}
function wn(e) {
  var r, o, i, s;
  const n = Object.keys(e.shape);
  for (const c of n)
    if (!((s = (i = (o = (r = e.shape) == null ? void 0 : r[c]) == null ? void 0 : o._zod) == null ? void 0 : i.traits) != null && s.has("$ZodType")))
      throw new Error(`Invalid element at key "${c}": expected a Zod schema`);
  const t = nt(e.shape);
  return {
    ...e,
    keys: n,
    keySet: new Set(n),
    numKeys: n.length,
    optionalKeys: new Set(t)
  };
}
function kn(e, n, t, r, o, i) {
  const s = [], c = o.keySet, u = o.catchall._zod, l = u.def.type, f = u.optout === "optional";
  for (const d in n) {
    if (c.has(d))
      continue;
    if (l === "never") {
      s.push(d);
      continue;
    }
    const m = u.run({ value: n[d], issues: [] }, r);
    m instanceof Promise ? e.push(m.then((h) => ie(h, t, d, n, f))) : ie(m, t, d, n, f);
  }
  return s.length && t.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: n,
    inst: i
  }), e.length ? Promise.all(e).then(() => t) : t;
}
const Ur = /* @__PURE__ */ a("$ZodObject", (e, n) => {
  b.init(e, n);
  const t = Object.getOwnPropertyDescriptor(n, "shape");
  if (!(t != null && t.get)) {
    const c = n.shape;
    Object.defineProperty(n, "shape", {
      get: () => {
        const u = { ...c };
        return Object.defineProperty(n, "shape", {
          value: u
        }), u;
      }
    });
  }
  const r = ye(() => wn(n));
  g(e._zod, "propValues", () => {
    const c = n.shape, u = {};
    for (const l in c) {
      const f = c[l]._zod;
      if (f.values) {
        u[l] ?? (u[l] = /* @__PURE__ */ new Set());
        for (const d of f.values)
          u[l].add(d);
      }
    }
    return u;
  });
  const o = oe, i = n.catchall;
  let s;
  e._zod.parse = (c, u) => {
    s ?? (s = r.value);
    const l = c.value;
    if (!o(l))
      return c.issues.push({
        expected: "object",
        code: "invalid_type",
        input: l,
        inst: e
      }), c;
    c.value = {};
    const f = [], d = s.shape;
    for (const m of s.keys) {
      const h = d[m], v = h._zod.optout === "optional", _ = h._zod.run({ value: l[m], issues: [] }, u);
      _ instanceof Promise ? f.push(_.then((k) => ie(k, c, m, l, v))) : ie(_, c, m, l, v);
    }
    return i ? kn(f, l, c, u, r.value, e) : f.length ? Promise.all(f).then(() => c) : c;
  };
}), xr = /* @__PURE__ */ a("$ZodObjectJIT", (e, n) => {
  Ur.init(e, n);
  const t = e._zod.parse, r = ye(() => wn(n)), o = (m) => {
    var H;
    const h = new cr(["shape", "payload", "ctx"]), v = r.value, _ = (N) => {
      const O = Te(N);
      return `shape[${O}]._zod.run({ value: input[${O}], issues: [] }, ctx)`;
    };
    h.write("const input = payload.value;");
    const k = /* @__PURE__ */ Object.create(null);
    let M = 0;
    for (const N of v.keys)
      k[N] = `key_${M++}`;
    h.write("const newResult = {};");
    for (const N of v.keys) {
      const O = k[N], P = Te(N), de = m[N], Vn = ((H = de == null ? void 0 : de._zod) == null ? void 0 : H.optout) === "optional";
      h.write(`const ${O} = ${_(N)};`), Vn ? h.write(`
        if (${O}.issues.length) {
          if (${P} in input) {
            payload.issues = payload.issues.concat(${O}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${P}, ...iss.path] : [${P}]
            })));
          }
        }
        
        if (${O}.value === undefined) {
          if (${P} in input) {
            newResult[${P}] = undefined;
          }
        } else {
          newResult[${P}] = ${O}.value;
        }
        
      `) : h.write(`
        if (${O}.issues.length) {
          payload.issues = payload.issues.concat(${O}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${P}, ...iss.path] : [${P}]
          })));
        }
        
        if (${O}.value === undefined) {
          if (${P} in input) {
            newResult[${P}] = undefined;
          }
        } else {
          newResult[${P}] = ${O}.value;
        }
        
      `);
    }
    h.write("payload.value = newResult;"), h.write("return payload;");
    const $ = h.compile();
    return (N, O) => $(m, N, O);
  };
  let i;
  const s = oe, c = !sn.jitless, l = c && Qn.value, f = n.catchall;
  let d;
  e._zod.parse = (m, h) => {
    d ?? (d = r.value);
    const v = m.value;
    return s(v) ? c && l && (h == null ? void 0 : h.async) === !1 && h.jitless !== !0 ? (i || (i = o(n.shape)), m = i(m, h), f ? kn([], v, m, h, d, e) : m) : t(m, h) : (m.issues.push({
      expected: "object",
      code: "invalid_type",
      input: v,
      inst: e
    }), m);
  };
});
function Ae(e, n, t, r) {
  for (const i of e)
    if (i.issues.length === 0)
      return n.value = i.value, n;
  const o = e.filter((i) => !x(i));
  return o.length === 1 ? (n.value = o[0].value, o[0]) : (n.issues.push({
    code: "invalid_union",
    input: n.value,
    inst: t,
    errors: e.map((i) => i.issues.map((s) => F(s, r, D())))
  }), n);
}
const Jr = /* @__PURE__ */ a("$ZodUnion", (e, n) => {
  b.init(e, n), g(e._zod, "optin", () => n.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0), g(e._zod, "optout", () => n.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0), g(e._zod, "values", () => {
    if (n.options.every((o) => o._zod.values))
      return new Set(n.options.flatMap((o) => Array.from(o._zod.values)));
  }), g(e._zod, "pattern", () => {
    if (n.options.every((o) => o._zod.pattern)) {
      const o = n.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${o.map((i) => be(i.source)).join("|")})$`);
    }
  });
  const t = n.options.length === 1, r = n.options[0]._zod.run;
  e._zod.parse = (o, i) => {
    if (t)
      return r(o, i);
    let s = !1;
    const c = [];
    for (const u of n.options) {
      const l = u._zod.run({
        value: o.value,
        issues: []
      }, i);
      if (l instanceof Promise)
        c.push(l), s = !0;
      else {
        if (l.issues.length === 0)
          return l;
        c.push(l);
      }
    }
    return s ? Promise.all(c).then((u) => Ae(u, o, e, i)) : Ae(c, o, e, i);
  };
}), Lr = /* @__PURE__ */ a("$ZodIntersection", (e, n) => {
  b.init(e, n), e._zod.parse = (t, r) => {
    const o = t.value, i = n.left._zod.run({ value: o, issues: [] }, r), s = n.right._zod.run({ value: o, issues: [] }, r);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([u, l]) => je(t, u, l)) : je(t, i, s);
  };
});
function ge(e, n) {
  if (e === n)
    return { valid: !0, data: e };
  if (e instanceof Date && n instanceof Date && +e == +n)
    return { valid: !0, data: e };
  if (B(e) && B(n)) {
    const t = Object.keys(n), r = Object.keys(e).filter((i) => t.indexOf(i) !== -1), o = { ...e, ...n };
    for (const i of r) {
      const s = ge(e[i], n[i]);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [i, ...s.mergeErrorPath]
        };
      o[i] = s.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(n)) {
    if (e.length !== n.length)
      return { valid: !1, mergeErrorPath: [] };
    const t = [];
    for (let r = 0; r < e.length; r++) {
      const o = e[r], i = n[r], s = ge(o, i);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...s.mergeErrorPath]
        };
      t.push(s.data);
    }
    return { valid: !0, data: t };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function je(e, n, t) {
  const r = /* @__PURE__ */ new Map();
  let o;
  for (const c of n.issues)
    if (c.code === "unrecognized_keys") {
      o ?? (o = c);
      for (const u of c.keys)
        r.has(u) || r.set(u, {}), r.get(u).l = !0;
    } else
      e.issues.push(c);
  for (const c of t.issues)
    if (c.code === "unrecognized_keys")
      for (const u of c.keys)
        r.has(u) || r.set(u, {}), r.get(u).r = !0;
    else
      e.issues.push(c);
  const i = [...r].filter(([, c]) => c.l && c.r).map(([c]) => c);
  if (i.length && o && e.issues.push({ ...o, keys: i }), x(e))
    return e;
  const s = ge(n.value, t.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return e.value = s.data, e;
}
const Mr = /* @__PURE__ */ a("$ZodEnum", (e, n) => {
  b.init(e, n);
  const t = cn(n.entries), r = new Set(t);
  e._zod.values = r, e._zod.pattern = new RegExp(`^(${t.filter((o) => et.has(typeof o)).map((o) => typeof o == "string" ? ue(o) : o.toString()).join("|")})$`), e._zod.parse = (o, i) => {
    const s = o.value;
    return r.has(s) || o.issues.push({
      code: "invalid_value",
      values: t,
      input: s,
      inst: e
    }), o;
  };
}), Vr = /* @__PURE__ */ a("$ZodTransform", (e, n) => {
  b.init(e, n), e._zod.parse = (t, r) => {
    if (r.direction === "backward")
      throw new on(e.constructor.name);
    const o = n.transform(t.value, t);
    if (r.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((s) => (t.value = s, t));
    if (o instanceof Promise)
      throw new J();
    return t.value = o, t;
  };
});
function Re(e, n) {
  return e.issues.length && n === void 0 ? { issues: [], value: void 0 } : e;
}
const $n = /* @__PURE__ */ a("$ZodOptional", (e, n) => {
  b.init(e, n), e._zod.optin = "optional", e._zod.optout = "optional", g(e._zod, "values", () => n.innerType._zod.values ? /* @__PURE__ */ new Set([...n.innerType._zod.values, void 0]) : void 0), g(e._zod, "pattern", () => {
    const t = n.innerType._zod.pattern;
    return t ? new RegExp(`^(${be(t.source)})?$`) : void 0;
  }), e._zod.parse = (t, r) => {
    if (n.innerType._zod.optin === "optional") {
      const o = n.innerType._zod.run(t, r);
      return o instanceof Promise ? o.then((i) => Re(i, t.value)) : Re(o, t.value);
    }
    return t.value === void 0 ? t : n.innerType._zod.run(t, r);
  };
}), Wr = /* @__PURE__ */ a("$ZodExactOptional", (e, n) => {
  $n.init(e, n), g(e._zod, "values", () => n.innerType._zod.values), g(e._zod, "pattern", () => n.innerType._zod.pattern), e._zod.parse = (t, r) => n.innerType._zod.run(t, r);
}), Gr = /* @__PURE__ */ a("$ZodNullable", (e, n) => {
  b.init(e, n), g(e._zod, "optin", () => n.innerType._zod.optin), g(e._zod, "optout", () => n.innerType._zod.optout), g(e._zod, "pattern", () => {
    const t = n.innerType._zod.pattern;
    return t ? new RegExp(`^(${be(t.source)}|null)$`) : void 0;
  }), g(e._zod, "values", () => n.innerType._zod.values ? /* @__PURE__ */ new Set([...n.innerType._zod.values, null]) : void 0), e._zod.parse = (t, r) => t.value === null ? t : n.innerType._zod.run(t, r);
}), Br = /* @__PURE__ */ a("$ZodDefault", (e, n) => {
  b.init(e, n), e._zod.optin = "optional", g(e._zod, "values", () => n.innerType._zod.values), e._zod.parse = (t, r) => {
    if (r.direction === "backward")
      return n.innerType._zod.run(t, r);
    if (t.value === void 0)
      return t.value = n.defaultValue, t;
    const o = n.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then((i) => Ce(i, n)) : Ce(o, n);
  };
});
function Ce(e, n) {
  return e.value === void 0 && (e.value = n.defaultValue), e;
}
const Kr = /* @__PURE__ */ a("$ZodPrefault", (e, n) => {
  b.init(e, n), e._zod.optin = "optional", g(e._zod, "values", () => n.innerType._zod.values), e._zod.parse = (t, r) => (r.direction === "backward" || t.value === void 0 && (t.value = n.defaultValue), n.innerType._zod.run(t, r));
}), Xr = /* @__PURE__ */ a("$ZodNonOptional", (e, n) => {
  b.init(e, n), g(e._zod, "values", () => {
    const t = n.innerType._zod.values;
    return t ? new Set([...t].filter((r) => r !== void 0)) : void 0;
  }), e._zod.parse = (t, r) => {
    const o = n.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then((i) => De(i, e)) : De(o, e);
  };
});
function De(e, n) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: n
  }), e;
}
const Yr = /* @__PURE__ */ a("$ZodCatch", (e, n) => {
  b.init(e, n), g(e._zod, "optin", () => n.innerType._zod.optin), g(e._zod, "optout", () => n.innerType._zod.optout), g(e._zod, "values", () => n.innerType._zod.values), e._zod.parse = (t, r) => {
    if (r.direction === "backward")
      return n.innerType._zod.run(t, r);
    const o = n.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then((i) => (t.value = i.value, i.issues.length && (t.value = n.catchValue({
      ...t,
      error: {
        issues: i.issues.map((s) => F(s, r, D()))
      },
      input: t.value
    }), t.issues = []), t)) : (t.value = o.value, o.issues.length && (t.value = n.catchValue({
      ...t,
      error: {
        issues: o.issues.map((i) => F(i, r, D()))
      },
      input: t.value
    }), t.issues = []), t);
  };
}), qr = /* @__PURE__ */ a("$ZodPipe", (e, n) => {
  b.init(e, n), g(e._zod, "values", () => n.in._zod.values), g(e._zod, "optin", () => n.in._zod.optin), g(e._zod, "optout", () => n.out._zod.optout), g(e._zod, "propValues", () => n.in._zod.propValues), e._zod.parse = (t, r) => {
    if (r.direction === "backward") {
      const i = n.out._zod.run(t, r);
      return i instanceof Promise ? i.then((s) => ne(s, n.in, r)) : ne(i, n.in, r);
    }
    const o = n.in._zod.run(t, r);
    return o instanceof Promise ? o.then((i) => ne(i, n.out, r)) : ne(o, n.out, r);
  };
});
function ne(e, n, t) {
  return e.issues.length ? (e.aborted = !0, e) : n._zod.run({ value: e.value, issues: e.issues }, t);
}
const Hr = /* @__PURE__ */ a("$ZodReadonly", (e, n) => {
  b.init(e, n), g(e._zod, "propValues", () => n.innerType._zod.propValues), g(e._zod, "values", () => n.innerType._zod.values), g(e._zod, "optin", () => {
    var t, r;
    return (r = (t = n.innerType) == null ? void 0 : t._zod) == null ? void 0 : r.optin;
  }), g(e._zod, "optout", () => {
    var t, r;
    return (r = (t = n.innerType) == null ? void 0 : t._zod) == null ? void 0 : r.optout;
  }), e._zod.parse = (t, r) => {
    if (r.direction === "backward")
      return n.innerType._zod.run(t, r);
    const o = n.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then(Fe) : Fe(o);
  };
});
function Fe(e) {
  return e.value = Object.freeze(e.value), e;
}
const Qr = /* @__PURE__ */ a("$ZodCustom", (e, n) => {
  E.init(e, n), b.init(e, n), e._zod.parse = (t, r) => t, e._zod.check = (t) => {
    const r = t.value, o = n.fn(r);
    if (o instanceof Promise)
      return o.then((i) => Ue(i, t, r, e));
    Ue(o, t, r, e);
  };
});
function Ue(e, n, t, r) {
  if (!e) {
    const o = {
      code: "custom",
      input: t,
      inst: r,
      // incorporates params.error into issue reporting
      path: [...r._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !r._zod.def.abort
      // params: inst._zod.def.params,
    };
    r._zod.def.params && (o.params = r._zod.def.params), n.issues.push(K(o));
  }
}
var xe;
class eo {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(n, ...t) {
    const r = t[0];
    return this._map.set(n, r), r && typeof r == "object" && "id" in r && this._idmap.set(r.id, n), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(n) {
    const t = this._map.get(n);
    return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(n), this;
  }
  get(n) {
    const t = n._zod.parent;
    if (t) {
      const r = { ...this.get(t) ?? {} };
      delete r.id;
      const o = { ...r, ...this._map.get(n) };
      return Object.keys(o).length ? o : void 0;
    }
    return this._map.get(n);
  }
  has(n) {
    return this._map.has(n);
  }
}
function no() {
  return new eo();
}
(xe = globalThis).__zod_globalRegistry ?? (xe.__zod_globalRegistry = no());
const W = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function to(e, n) {
  return new e({
    type: "string",
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function ro(e, n) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Je(e, n) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function oo(e, n) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function io(e, n) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function so(e, n) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function co(e, n) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Zn(e, n) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function uo(e, n) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function ao(e, n) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function lo(e, n) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function fo(e, n) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function po(e, n) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function ho(e, n) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function mo(e, n) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function _o(e, n) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function go(e, n) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function vo(e, n) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function yo(e, n) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function zo(e, n) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function bo(e, n) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function wo(e, n) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function ko(e, n) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function $o(e, n) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Zo(e, n) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function So(e, n) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Oo(e, n) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Eo(e, n) {
  return new e({
    type: "number",
    checks: [],
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Io(e, n) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function To(e, n) {
  return new e({
    type: "boolean",
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Po(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function No(e, n) {
  return new e({
    type: "never",
    ...p(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Le(e, n) {
  return new vn({
    check: "less_than",
    ...p(n),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function pe(e, n) {
  return new vn({
    check: "less_than",
    ...p(n),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Me(e, n) {
  return new yn({
    check: "greater_than",
    ...p(n),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function he(e, n) {
  return new yn({
    check: "greater_than",
    ...p(n),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Ve(e, n) {
  return new Xt({
    check: "multiple_of",
    ...p(n),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function Sn(e, n) {
  return new qt({
    check: "max_length",
    ...p(n),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function se(e, n) {
  return new Ht({
    check: "min_length",
    ...p(n),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function On(e, n) {
  return new Qt({
    check: "length_equals",
    ...p(n),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ao(e, n) {
  return new er({
    check: "string_format",
    format: "regex",
    ...p(n),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function jo(e) {
  return new nr({
    check: "string_format",
    format: "lowercase",
    ...p(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Ro(e) {
  return new tr({
    check: "string_format",
    format: "uppercase",
    ...p(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Co(e, n) {
  return new rr({
    check: "string_format",
    format: "includes",
    ...p(n),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function Do(e, n) {
  return new or({
    check: "string_format",
    format: "starts_with",
    ...p(n),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Fo(e, n) {
  return new ir({
    check: "string_format",
    format: "ends_with",
    ...p(n),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function L(e) {
  return new sr({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function Uo(e) {
  return /* @__PURE__ */ L((n) => n.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function xo() {
  return /* @__PURE__ */ L((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Jo() {
  return /* @__PURE__ */ L((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Lo() {
  return /* @__PURE__ */ L((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Mo() {
  return /* @__PURE__ */ L((e) => Hn(e));
}
// @__NO_SIDE_EFFECTS__
function Vo(e, n, t) {
  return new e({
    type: "array",
    element: n,
    // get element() {
    //   return element;
    // },
    ...p(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Wo(e, n, t) {
  return new e({
    type: "custom",
    check: "custom",
    fn: n,
    ...p(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Go(e) {
  const n = /* @__PURE__ */ Bo((t) => (t.addIssue = (r) => {
    if (typeof r == "string")
      t.issues.push(K(r, t.value, n._zod.def));
    else {
      const o = r;
      o.fatal && (o.continue = !1), o.code ?? (o.code = "custom"), o.input ?? (o.input = t.value), o.inst ?? (o.inst = n), o.continue ?? (o.continue = !n._zod.def.abort), t.issues.push(K(o));
    }
  }, e(t.value, t)));
  return n;
}
// @__NO_SIDE_EFFECTS__
function Bo(e, n) {
  const t = new E({
    check: "custom",
    ...p(n)
  });
  return t._zod.check = e, t;
}
function En(e) {
  let n = (e == null ? void 0 : e.target) ?? "draft-2020-12";
  return n === "draft-4" && (n = "draft-04"), n === "draft-7" && (n = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: (e == null ? void 0 : e.metadata) ?? W,
    target: n,
    unrepresentable: (e == null ? void 0 : e.unrepresentable) ?? "throw",
    override: (e == null ? void 0 : e.override) ?? (() => {
    }),
    io: (e == null ? void 0 : e.io) ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: (e == null ? void 0 : e.cycles) ?? "ref",
    reused: (e == null ? void 0 : e.reused) ?? "inline",
    external: (e == null ? void 0 : e.external) ?? void 0
  };
}
function Z(e, n, t = { path: [], schemaPath: [] }) {
  var f, d;
  var r;
  const o = e._zod.def, i = n.seen.get(e);
  if (i)
    return i.count++, t.schemaPath.includes(e) && (i.cycle = t.path), i.schema;
  const s = { schema: {}, count: 1, cycle: void 0, path: t.path };
  n.seen.set(e, s);
  const c = (d = (f = e._zod).toJSONSchema) == null ? void 0 : d.call(f);
  if (c)
    s.schema = c;
  else {
    const m = {
      ...t,
      schemaPath: [...t.schemaPath, e],
      path: t.path
    };
    if (e._zod.processJSONSchema)
      e._zod.processJSONSchema(n, s.schema, m);
    else {
      const v = s.schema, _ = n.processors[o.type];
      if (!_)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      _(e, n, v, m);
    }
    const h = e._zod.parent;
    h && (s.ref || (s.ref = h), Z(h, n, m), n.seen.get(h).isParent = !0);
  }
  const u = n.metadataRegistry.get(e);
  return u && Object.assign(s.schema, u), n.io === "input" && S(e) && (delete s.schema.examples, delete s.schema.default), n.io === "input" && s.schema._prefault && ((r = s.schema).default ?? (r.default = s.schema._prefault)), delete s.schema._prefault, n.seen.get(e).schema;
}
function In(e, n) {
  var s, c, u, l;
  const t = e.seen.get(n);
  if (!t)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = /* @__PURE__ */ new Map();
  for (const f of e.seen.entries()) {
    const d = (s = e.metadataRegistry.get(f[0])) == null ? void 0 : s.id;
    if (d) {
      const m = r.get(d);
      if (m && m !== f[0])
        throw new Error(`Duplicate schema id "${d}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(d, f[0]);
    }
  }
  const o = (f) => {
    var _;
    const d = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const k = (_ = e.external.registry.get(f[0])) == null ? void 0 : _.id, M = e.external.uri ?? ((H) => H);
      if (k)
        return { ref: M(k) };
      const $ = f[1].defId ?? f[1].schema.id ?? `schema${e.counter++}`;
      return f[1].defId = $, { defId: $, ref: `${M("__shared")}#/${d}/${$}` };
    }
    if (f[1] === t)
      return { ref: "#" };
    const h = `#/${d}/`, v = f[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: v, ref: h + v };
  }, i = (f) => {
    if (f[1].schema.$ref)
      return;
    const d = f[1], { ref: m, defId: h } = o(f);
    d.def = { ...d.schema }, h && (d.defId = h);
    const v = d.schema;
    for (const _ in v)
      delete v[_];
    v.$ref = m;
  };
  if (e.cycles === "throw")
    for (const f of e.seen.entries()) {
      const d = f[1];
      if (d.cycle)
        throw new Error(`Cycle detected: #/${(c = d.cycle) == null ? void 0 : c.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const f of e.seen.entries()) {
    const d = f[1];
    if (n === f[0]) {
      i(f);
      continue;
    }
    if (e.external) {
      const h = (u = e.external.registry.get(f[0])) == null ? void 0 : u.id;
      if (n !== f[0] && h) {
        i(f);
        continue;
      }
    }
    if ((l = e.metadataRegistry.get(f[0])) == null ? void 0 : l.id) {
      i(f);
      continue;
    }
    if (d.cycle) {
      i(f);
      continue;
    }
    if (d.count > 1 && e.reused === "ref") {
      i(f);
      continue;
    }
  }
}
function Tn(e, n) {
  var s, c, u;
  const t = e.seen.get(n);
  if (!t)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (l) => {
    const f = e.seen.get(l);
    if (f.ref === null)
      return;
    const d = f.def ?? f.schema, m = { ...d }, h = f.ref;
    if (f.ref = null, h) {
      r(h);
      const _ = e.seen.get(h), k = _.schema;
      if (k.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (d.allOf = d.allOf ?? [], d.allOf.push(k)) : Object.assign(d, k), Object.assign(d, m), l._zod.parent === h)
        for (const $ in d)
          $ === "$ref" || $ === "allOf" || $ in m || delete d[$];
      if (k.$ref && _.def)
        for (const $ in d)
          $ === "$ref" || $ === "allOf" || $ in _.def && JSON.stringify(d[$]) === JSON.stringify(_.def[$]) && delete d[$];
    }
    const v = l._zod.parent;
    if (v && v !== h) {
      r(v);
      const _ = e.seen.get(v);
      if (_ != null && _.schema.$ref && (d.$ref = _.schema.$ref, _.def))
        for (const k in d)
          k === "$ref" || k === "allOf" || k in _.def && JSON.stringify(d[k]) === JSON.stringify(_.def[k]) && delete d[k];
    }
    e.override({
      zodSchema: l,
      jsonSchema: d,
      path: f.path ?? []
    });
  };
  for (const l of [...e.seen.entries()].reverse())
    r(l[0]);
  const o = {};
  if (e.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : e.target, (s = e.external) != null && s.uri) {
    const l = (c = e.external.registry.get(n)) == null ? void 0 : c.id;
    if (!l)
      throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(l);
  }
  Object.assign(o, t.def ?? t.schema);
  const i = ((u = e.external) == null ? void 0 : u.defs) ?? {};
  for (const l of e.seen.entries()) {
    const f = l[1];
    f.def && f.defId && (i[f.defId] = f.def);
  }
  e.external || Object.keys(i).length > 0 && (e.target === "draft-2020-12" ? o.$defs = i : o.definitions = i);
  try {
    const l = JSON.parse(JSON.stringify(o));
    return Object.defineProperty(l, "~standard", {
      value: {
        ...n["~standard"],
        jsonSchema: {
          input: ce(n, "input", e.processors),
          output: ce(n, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), l;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function S(e, n) {
  const t = n ?? { seen: /* @__PURE__ */ new Set() };
  if (t.seen.has(e))
    return !1;
  t.seen.add(e);
  const r = e._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return S(r.element, t);
  if (r.type === "set")
    return S(r.valueType, t);
  if (r.type === "lazy")
    return S(r.getter(), t);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault")
    return S(r.innerType, t);
  if (r.type === "intersection")
    return S(r.left, t) || S(r.right, t);
  if (r.type === "record" || r.type === "map")
    return S(r.keyType, t) || S(r.valueType, t);
  if (r.type === "pipe")
    return S(r.in, t) || S(r.out, t);
  if (r.type === "object") {
    for (const o in r.shape)
      if (S(r.shape[o], t))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const o of r.options)
      if (S(o, t))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const o of r.items)
      if (S(o, t))
        return !0;
    return !!(r.rest && S(r.rest, t));
  }
  return !1;
}
const Ko = (e, n = {}) => (t) => {
  const r = En({ ...t, processors: n });
  return Z(e, r), In(r, e), Tn(r, e);
}, ce = (e, n, t = {}) => (r) => {
  const { libraryOptions: o, target: i } = r ?? {}, s = En({ ...o ?? {}, target: i, io: n, processors: t });
  return Z(e, s), In(s, e), Tn(s, e);
}, Xo = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, Yo = (e, n, t, r) => {
  const o = t;
  o.type = "string";
  const { minimum: i, maximum: s, format: c, patterns: u, contentEncoding: l } = e._zod.bag;
  if (typeof i == "number" && (o.minLength = i), typeof s == "number" && (o.maxLength = s), c && (o.format = Xo[c] ?? c, o.format === "" && delete o.format, c === "time" && delete o.format), l && (o.contentEncoding = l), u && u.size > 0) {
    const f = [...u];
    f.length === 1 ? o.pattern = f[0].source : f.length > 1 && (o.allOf = [
      ...f.map((d) => ({
        ...n.target === "draft-07" || n.target === "draft-04" || n.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: d.source
      }))
    ]);
  }
}, qo = (e, n, t, r) => {
  const o = t, { minimum: i, maximum: s, format: c, multipleOf: u, exclusiveMaximum: l, exclusiveMinimum: f } = e._zod.bag;
  typeof c == "string" && c.includes("int") ? o.type = "integer" : o.type = "number", typeof f == "number" && (n.target === "draft-04" || n.target === "openapi-3.0" ? (o.minimum = f, o.exclusiveMinimum = !0) : o.exclusiveMinimum = f), typeof i == "number" && (o.minimum = i, typeof f == "number" && n.target !== "draft-04" && (f >= i ? delete o.minimum : delete o.exclusiveMinimum)), typeof l == "number" && (n.target === "draft-04" || n.target === "openapi-3.0" ? (o.maximum = l, o.exclusiveMaximum = !0) : o.exclusiveMaximum = l), typeof s == "number" && (o.maximum = s, typeof l == "number" && n.target !== "draft-04" && (l <= s ? delete o.maximum : delete o.exclusiveMaximum)), typeof u == "number" && (o.multipleOf = u);
}, Ho = (e, n, t, r) => {
  t.type = "boolean";
}, Qo = (e, n, t, r) => {
  t.not = {};
}, ei = (e, n, t, r) => {
}, ni = (e, n, t, r) => {
  const o = e._zod.def, i = cn(o.entries);
  i.every((s) => typeof s == "number") && (t.type = "number"), i.every((s) => typeof s == "string") && (t.type = "string"), t.enum = i;
}, ti = (e, n, t, r) => {
  if (n.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, ri = (e, n, t, r) => {
  if (n.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, oi = (e, n, t, r) => {
  const o = t, i = e._zod.def, { minimum: s, maximum: c } = e._zod.bag;
  typeof s == "number" && (o.minItems = s), typeof c == "number" && (o.maxItems = c), o.type = "array", o.items = Z(i.element, n, { ...r, path: [...r.path, "items"] });
}, ii = (e, n, t, r) => {
  var l;
  const o = t, i = e._zod.def;
  o.type = "object", o.properties = {};
  const s = i.shape;
  for (const f in s)
    o.properties[f] = Z(s[f], n, {
      ...r,
      path: [...r.path, "properties", f]
    });
  const c = new Set(Object.keys(s)), u = new Set([...c].filter((f) => {
    const d = i.shape[f]._zod;
    return n.io === "input" ? d.optin === void 0 : d.optout === void 0;
  }));
  u.size > 0 && (o.required = Array.from(u)), ((l = i.catchall) == null ? void 0 : l._zod.def.type) === "never" ? o.additionalProperties = !1 : i.catchall ? i.catchall && (o.additionalProperties = Z(i.catchall, n, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : n.io === "output" && (o.additionalProperties = !1);
}, si = (e, n, t, r) => {
  const o = e._zod.def, i = o.inclusive === !1, s = o.options.map((c, u) => Z(c, n, {
    ...r,
    path: [...r.path, i ? "oneOf" : "anyOf", u]
  }));
  i ? t.oneOf = s : t.anyOf = s;
}, ci = (e, n, t, r) => {
  const o = e._zod.def, i = Z(o.left, n, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), s = Z(o.right, n, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), c = (l) => "allOf" in l && Object.keys(l).length === 1, u = [
    ...c(i) ? i.allOf : [i],
    ...c(s) ? s.allOf : [s]
  ];
  t.allOf = u;
}, ui = (e, n, t, r) => {
  const o = e._zod.def, i = Z(o.innerType, n, r), s = n.seen.get(e);
  n.target === "openapi-3.0" ? (s.ref = o.innerType, t.nullable = !0) : t.anyOf = [i, { type: "null" }];
}, ai = (e, n, t, r) => {
  const o = e._zod.def;
  Z(o.innerType, n, r);
  const i = n.seen.get(e);
  i.ref = o.innerType;
}, li = (e, n, t, r) => {
  const o = e._zod.def;
  Z(o.innerType, n, r);
  const i = n.seen.get(e);
  i.ref = o.innerType, t.default = JSON.parse(JSON.stringify(o.defaultValue));
}, fi = (e, n, t, r) => {
  const o = e._zod.def;
  Z(o.innerType, n, r);
  const i = n.seen.get(e);
  i.ref = o.innerType, n.io === "input" && (t._prefault = JSON.parse(JSON.stringify(o.defaultValue)));
}, di = (e, n, t, r) => {
  const o = e._zod.def;
  Z(o.innerType, n, r);
  const i = n.seen.get(e);
  i.ref = o.innerType;
  let s;
  try {
    s = o.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  t.default = s;
}, pi = (e, n, t, r) => {
  const o = e._zod.def, i = n.io === "input" ? o.in._zod.def.type === "transform" ? o.out : o.in : o.out;
  Z(i, n, r);
  const s = n.seen.get(e);
  s.ref = i;
}, hi = (e, n, t, r) => {
  const o = e._zod.def;
  Z(o.innerType, n, r);
  const i = n.seen.get(e);
  i.ref = o.innerType, t.readOnly = !0;
}, Pn = (e, n, t, r) => {
  const o = e._zod.def;
  Z(o.innerType, n, r);
  const i = n.seen.get(e);
  i.ref = o.innerType;
}, mi = /* @__PURE__ */ a("ZodISODateTime", (e, n) => {
  zr.init(e, n), z.init(e, n);
});
function _i(e) {
  return /* @__PURE__ */ $o(mi, e);
}
const gi = /* @__PURE__ */ a("ZodISODate", (e, n) => {
  br.init(e, n), z.init(e, n);
});
function vi(e) {
  return /* @__PURE__ */ Zo(gi, e);
}
const yi = /* @__PURE__ */ a("ZodISOTime", (e, n) => {
  wr.init(e, n), z.init(e, n);
});
function zi(e) {
  return /* @__PURE__ */ So(yi, e);
}
const bi = /* @__PURE__ */ a("ZodISODuration", (e, n) => {
  kr.init(e, n), z.init(e, n);
});
function wi(e) {
  return /* @__PURE__ */ Oo(bi, e);
}
const ki = (e, n) => {
  dn.init(e, n), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (t) => ft(e, t)
      // enumerable: false,
    },
    flatten: {
      value: (t) => lt(e, t)
      // enumerable: false,
    },
    addIssue: {
      value: (t) => {
        e.issues.push(t), e.message = JSON.stringify(e.issues, _e, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (t) => {
        e.issues.push(...t), e.message = JSON.stringify(e.issues, _e, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return e.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, T = a("ZodError", ki, {
  Parent: Error
}), $i = /* @__PURE__ */ ke(T), Zi = /* @__PURE__ */ $e(T), Si = /* @__PURE__ */ ae(T), Oi = /* @__PURE__ */ le(T), Ei = /* @__PURE__ */ ht(T), Ii = /* @__PURE__ */ mt(T), Ti = /* @__PURE__ */ _t(T), Pi = /* @__PURE__ */ gt(T), Ni = /* @__PURE__ */ vt(T), Ai = /* @__PURE__ */ yt(T), ji = /* @__PURE__ */ zt(T), Ri = /* @__PURE__ */ bt(T), w = /* @__PURE__ */ a("ZodType", (e, n) => (b.init(e, n), Object.assign(e["~standard"], {
  jsonSchema: {
    input: ce(e, "input"),
    output: ce(e, "output")
  }
}), e.toJSONSchema = Ko(e, {}), e.def = n, e.type = n.type, Object.defineProperty(e, "_def", { value: n }), e.check = (...t) => e.clone(R(n, {
  checks: [
    ...n.checks ?? [],
    ...t.map((r) => typeof r == "function" ? { _zod: { check: r, def: { check: "custom" }, onattach: [] } } : r)
  ]
}), {
  parent: !0
}), e.with = e.check, e.clone = (t, r) => C(e, t, r), e.brand = () => e, e.register = (t, r) => (t.add(e, r), e), e.parse = (t, r) => $i(e, t, r, { callee: e.parse }), e.safeParse = (t, r) => Si(e, t, r), e.parseAsync = async (t, r) => Zi(e, t, r, { callee: e.parseAsync }), e.safeParseAsync = async (t, r) => Oi(e, t, r), e.spa = e.safeParseAsync, e.encode = (t, r) => Ei(e, t, r), e.decode = (t, r) => Ii(e, t, r), e.encodeAsync = async (t, r) => Ti(e, t, r), e.decodeAsync = async (t, r) => Pi(e, t, r), e.safeEncode = (t, r) => Ni(e, t, r), e.safeDecode = (t, r) => Ai(e, t, r), e.safeEncodeAsync = async (t, r) => ji(e, t, r), e.safeDecodeAsync = async (t, r) => Ri(e, t, r), e.refine = (t, r) => e.check(Os(t, r)), e.superRefine = (t) => e.check(Es(t)), e.overwrite = (t) => e.check(/* @__PURE__ */ L(t)), e.optional = () => Ke(e), e.exactOptional = () => hs(e), e.nullable = () => Xe(e), e.nullish = () => Ke(Xe(e)), e.nonoptional = (t) => zs(e, t), e.array = () => A(e), e.or = (t) => Rn([e, t]), e.and = (t) => ls(e, t), e.transform = (t) => Ye(e, ds(t)), e.default = (t) => gs(e, t), e.prefault = (t) => ys(e, t), e.catch = (t) => ws(e, t), e.pipe = (t) => Ye(e, t), e.readonly = () => Zs(e), e.describe = (t) => {
  const r = e.clone();
  return W.add(r, { description: t }), r;
}, Object.defineProperty(e, "description", {
  get() {
    var t;
    return (t = W.get(e)) == null ? void 0 : t.description;
  },
  configurable: !0
}), e.meta = (...t) => {
  if (t.length === 0)
    return W.get(e);
  const r = e.clone();
  return W.add(r, t[0]), r;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (t) => t(e), e)), Nn = /* @__PURE__ */ a("_ZodString", (e, n) => {
  Ze.init(e, n), w.init(e, n), e._zod.processJSONSchema = (r, o, i) => Yo(e, r, o);
  const t = e._zod.bag;
  e.format = t.format ?? null, e.minLength = t.minimum ?? null, e.maxLength = t.maximum ?? null, e.regex = (...r) => e.check(/* @__PURE__ */ Ao(...r)), e.includes = (...r) => e.check(/* @__PURE__ */ Co(...r)), e.startsWith = (...r) => e.check(/* @__PURE__ */ Do(...r)), e.endsWith = (...r) => e.check(/* @__PURE__ */ Fo(...r)), e.min = (...r) => e.check(/* @__PURE__ */ se(...r)), e.max = (...r) => e.check(/* @__PURE__ */ Sn(...r)), e.length = (...r) => e.check(/* @__PURE__ */ On(...r)), e.nonempty = (...r) => e.check(/* @__PURE__ */ se(1, ...r)), e.lowercase = (r) => e.check(/* @__PURE__ */ jo(r)), e.uppercase = (r) => e.check(/* @__PURE__ */ Ro(r)), e.trim = () => e.check(/* @__PURE__ */ xo()), e.normalize = (...r) => e.check(/* @__PURE__ */ Uo(...r)), e.toLowerCase = () => e.check(/* @__PURE__ */ Jo()), e.toUpperCase = () => e.check(/* @__PURE__ */ Lo()), e.slugify = () => e.check(/* @__PURE__ */ Mo());
}), Ci = /* @__PURE__ */ a("ZodString", (e, n) => {
  Ze.init(e, n), Nn.init(e, n), e.email = (t) => e.check(/* @__PURE__ */ ro(Di, t)), e.url = (t) => e.check(/* @__PURE__ */ Zn(An, t)), e.jwt = (t) => e.check(/* @__PURE__ */ ko(Qi, t)), e.emoji = (t) => e.check(/* @__PURE__ */ uo(Ui, t)), e.guid = (t) => e.check(/* @__PURE__ */ Je(We, t)), e.uuid = (t) => e.check(/* @__PURE__ */ oo(te, t)), e.uuidv4 = (t) => e.check(/* @__PURE__ */ io(te, t)), e.uuidv6 = (t) => e.check(/* @__PURE__ */ so(te, t)), e.uuidv7 = (t) => e.check(/* @__PURE__ */ co(te, t)), e.nanoid = (t) => e.check(/* @__PURE__ */ ao(xi, t)), e.guid = (t) => e.check(/* @__PURE__ */ Je(We, t)), e.cuid = (t) => e.check(/* @__PURE__ */ lo(Ji, t)), e.cuid2 = (t) => e.check(/* @__PURE__ */ fo(Li, t)), e.ulid = (t) => e.check(/* @__PURE__ */ po(Mi, t)), e.base64 = (t) => e.check(/* @__PURE__ */ zo(Yi, t)), e.base64url = (t) => e.check(/* @__PURE__ */ bo(qi, t)), e.xid = (t) => e.check(/* @__PURE__ */ ho(Vi, t)), e.ksuid = (t) => e.check(/* @__PURE__ */ mo(Wi, t)), e.ipv4 = (t) => e.check(/* @__PURE__ */ _o(Gi, t)), e.ipv6 = (t) => e.check(/* @__PURE__ */ go(Bi, t)), e.cidrv4 = (t) => e.check(/* @__PURE__ */ vo(Ki, t)), e.cidrv6 = (t) => e.check(/* @__PURE__ */ yo(Xi, t)), e.e164 = (t) => e.check(/* @__PURE__ */ wo(Hi, t)), e.datetime = (t) => e.check(_i(t)), e.date = (t) => e.check(vi(t)), e.time = (t) => e.check(zi(t)), e.duration = (t) => e.check(wi(t));
});
function j(e) {
  return /* @__PURE__ */ to(Ci, e);
}
const z = /* @__PURE__ */ a("ZodStringFormat", (e, n) => {
  y.init(e, n), Nn.init(e, n);
}), Di = /* @__PURE__ */ a("ZodEmail", (e, n) => {
  fr.init(e, n), z.init(e, n);
}), We = /* @__PURE__ */ a("ZodGUID", (e, n) => {
  ar.init(e, n), z.init(e, n);
}), te = /* @__PURE__ */ a("ZodUUID", (e, n) => {
  lr.init(e, n), z.init(e, n);
}), An = /* @__PURE__ */ a("ZodURL", (e, n) => {
  dr.init(e, n), z.init(e, n);
});
function Fi(e) {
  return /* @__PURE__ */ Zn(An, {
    protocol: /^https?$/,
    hostname: Ft,
    ...p(e)
  });
}
const Ui = /* @__PURE__ */ a("ZodEmoji", (e, n) => {
  pr.init(e, n), z.init(e, n);
}), xi = /* @__PURE__ */ a("ZodNanoID", (e, n) => {
  hr.init(e, n), z.init(e, n);
}), Ji = /* @__PURE__ */ a("ZodCUID", (e, n) => {
  mr.init(e, n), z.init(e, n);
}), Li = /* @__PURE__ */ a("ZodCUID2", (e, n) => {
  _r.init(e, n), z.init(e, n);
}), Mi = /* @__PURE__ */ a("ZodULID", (e, n) => {
  gr.init(e, n), z.init(e, n);
}), Vi = /* @__PURE__ */ a("ZodXID", (e, n) => {
  vr.init(e, n), z.init(e, n);
}), Wi = /* @__PURE__ */ a("ZodKSUID", (e, n) => {
  yr.init(e, n), z.init(e, n);
}), Gi = /* @__PURE__ */ a("ZodIPv4", (e, n) => {
  $r.init(e, n), z.init(e, n);
}), Bi = /* @__PURE__ */ a("ZodIPv6", (e, n) => {
  Zr.init(e, n), z.init(e, n);
}), Ki = /* @__PURE__ */ a("ZodCIDRv4", (e, n) => {
  Sr.init(e, n), z.init(e, n);
}), Xi = /* @__PURE__ */ a("ZodCIDRv6", (e, n) => {
  Or.init(e, n), z.init(e, n);
}), Yi = /* @__PURE__ */ a("ZodBase64", (e, n) => {
  Er.init(e, n), z.init(e, n);
}), qi = /* @__PURE__ */ a("ZodBase64URL", (e, n) => {
  Tr.init(e, n), z.init(e, n);
}), Hi = /* @__PURE__ */ a("ZodE164", (e, n) => {
  Pr.init(e, n), z.init(e, n);
}), Qi = /* @__PURE__ */ a("ZodJWT", (e, n) => {
  Ar.init(e, n), z.init(e, n);
}), jn = /* @__PURE__ */ a("ZodNumber", (e, n) => {
  bn.init(e, n), w.init(e, n), e._zod.processJSONSchema = (r, o, i) => qo(e, r, o), e.gt = (r, o) => e.check(/* @__PURE__ */ Me(r, o)), e.gte = (r, o) => e.check(/* @__PURE__ */ he(r, o)), e.min = (r, o) => e.check(/* @__PURE__ */ he(r, o)), e.lt = (r, o) => e.check(/* @__PURE__ */ Le(r, o)), e.lte = (r, o) => e.check(/* @__PURE__ */ pe(r, o)), e.max = (r, o) => e.check(/* @__PURE__ */ pe(r, o)), e.int = (r) => e.check(Ge(r)), e.safe = (r) => e.check(Ge(r)), e.positive = (r) => e.check(/* @__PURE__ */ Me(0, r)), e.nonnegative = (r) => e.check(/* @__PURE__ */ he(0, r)), e.negative = (r) => e.check(/* @__PURE__ */ Le(0, r)), e.nonpositive = (r) => e.check(/* @__PURE__ */ pe(0, r)), e.multipleOf = (r, o) => e.check(/* @__PURE__ */ Ve(r, o)), e.step = (r, o) => e.check(/* @__PURE__ */ Ve(r, o)), e.finite = () => e;
  const t = e._zod.bag;
  e.minValue = Math.max(t.minimum ?? Number.NEGATIVE_INFINITY, t.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(t.maximum ?? Number.POSITIVE_INFINITY, t.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (t.format ?? "").includes("int") || Number.isSafeInteger(t.multipleOf ?? 0.5), e.isFinite = !0, e.format = t.format ?? null;
});
function es(e) {
  return /* @__PURE__ */ Eo(jn, e);
}
const ns = /* @__PURE__ */ a("ZodNumberFormat", (e, n) => {
  jr.init(e, n), jn.init(e, n);
});
function Ge(e) {
  return /* @__PURE__ */ Io(ns, e);
}
const ts = /* @__PURE__ */ a("ZodBoolean", (e, n) => {
  Rr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => Ho(e, t, r);
});
function Se(e) {
  return /* @__PURE__ */ To(ts, e);
}
const rs = /* @__PURE__ */ a("ZodUnknown", (e, n) => {
  Cr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => ei();
});
function Be() {
  return /* @__PURE__ */ Po(rs);
}
const os = /* @__PURE__ */ a("ZodNever", (e, n) => {
  Dr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => Qo(e, t, r);
});
function is(e) {
  return /* @__PURE__ */ No(os, e);
}
const ss = /* @__PURE__ */ a("ZodArray", (e, n) => {
  Fr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => oi(e, t, r, o), e.element = n.element, e.min = (t, r) => e.check(/* @__PURE__ */ se(t, r)), e.nonempty = (t) => e.check(/* @__PURE__ */ se(1, t)), e.max = (t, r) => e.check(/* @__PURE__ */ Sn(t, r)), e.length = (t, r) => e.check(/* @__PURE__ */ On(t, r)), e.unwrap = () => e.element;
});
function A(e, n) {
  return /* @__PURE__ */ Vo(ss, e, n);
}
const cs = /* @__PURE__ */ a("ZodObject", (e, n) => {
  xr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => ii(e, t, r, o), g(e, "shape", () => n.shape), e.keyof = () => X(Object.keys(e._zod.def.shape)), e.catchall = (t) => e.clone({ ...e._zod.def, catchall: t }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: Be() }), e.loose = () => e.clone({ ...e._zod.def, catchall: Be() }), e.strict = () => e.clone({ ...e._zod.def, catchall: is() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (t) => it(e, t), e.safeExtend = (t) => st(e, t), e.merge = (t) => ct(e, t), e.pick = (t) => rt(e, t), e.omit = (t) => ot(e, t), e.partial = (...t) => ut(Cn, e, t[0]), e.required = (...t) => at(Dn, e, t[0]);
});
function I(e, n) {
  const t = {
    type: "object",
    shape: e ?? {},
    ...p(n)
  };
  return new cs(t);
}
const us = /* @__PURE__ */ a("ZodUnion", (e, n) => {
  Jr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => si(e, t, r, o), e.options = n.options;
});
function Rn(e, n) {
  return new us({
    type: "union",
    options: e,
    ...p(n)
  });
}
const as = /* @__PURE__ */ a("ZodIntersection", (e, n) => {
  Lr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => ci(e, t, r, o);
});
function ls(e, n) {
  return new as({
    type: "intersection",
    left: e,
    right: n
  });
}
const ve = /* @__PURE__ */ a("ZodEnum", (e, n) => {
  Mr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (r, o, i) => ni(e, r, o), e.enum = n.entries, e.options = Object.values(n.entries);
  const t = new Set(Object.keys(n.entries));
  e.extract = (r, o) => {
    const i = {};
    for (const s of r)
      if (t.has(s))
        i[s] = n.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new ve({
      ...n,
      checks: [],
      ...p(o),
      entries: i
    });
  }, e.exclude = (r, o) => {
    const i = { ...n.entries };
    for (const s of r)
      if (t.has(s))
        delete i[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new ve({
      ...n,
      checks: [],
      ...p(o),
      entries: i
    });
  };
});
function X(e, n) {
  const t = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new ve({
    type: "enum",
    entries: t,
    ...p(n)
  });
}
const fs = /* @__PURE__ */ a("ZodTransform", (e, n) => {
  Vr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => ri(e, t), e._zod.parse = (t, r) => {
    if (r.direction === "backward")
      throw new on(e.constructor.name);
    t.addIssue = (i) => {
      if (typeof i == "string")
        t.issues.push(K(i, t.value, n));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = t.value), s.inst ?? (s.inst = e), t.issues.push(K(s));
      }
    };
    const o = n.transform(t.value, t);
    return o instanceof Promise ? o.then((i) => (t.value = i, t)) : (t.value = o, t);
  };
});
function ds(e) {
  return new fs({
    type: "transform",
    transform: e
  });
}
const Cn = /* @__PURE__ */ a("ZodOptional", (e, n) => {
  $n.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => Pn(e, t, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Ke(e) {
  return new Cn({
    type: "optional",
    innerType: e
  });
}
const ps = /* @__PURE__ */ a("ZodExactOptional", (e, n) => {
  Wr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => Pn(e, t, r, o), e.unwrap = () => e._zod.def.innerType;
});
function hs(e) {
  return new ps({
    type: "optional",
    innerType: e
  });
}
const ms = /* @__PURE__ */ a("ZodNullable", (e, n) => {
  Gr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => ui(e, t, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Xe(e) {
  return new ms({
    type: "nullable",
    innerType: e
  });
}
const _s = /* @__PURE__ */ a("ZodDefault", (e, n) => {
  Br.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => li(e, t, r, o), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function gs(e, n) {
  return new _s({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof n == "function" ? n() : an(n);
    }
  });
}
const vs = /* @__PURE__ */ a("ZodPrefault", (e, n) => {
  Kr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => fi(e, t, r, o), e.unwrap = () => e._zod.def.innerType;
});
function ys(e, n) {
  return new vs({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof n == "function" ? n() : an(n);
    }
  });
}
const Dn = /* @__PURE__ */ a("ZodNonOptional", (e, n) => {
  Xr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => ai(e, t, r, o), e.unwrap = () => e._zod.def.innerType;
});
function zs(e, n) {
  return new Dn({
    type: "nonoptional",
    innerType: e,
    ...p(n)
  });
}
const bs = /* @__PURE__ */ a("ZodCatch", (e, n) => {
  Yr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => di(e, t, r, o), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function ws(e, n) {
  return new bs({
    type: "catch",
    innerType: e,
    catchValue: typeof n == "function" ? n : () => n
  });
}
const ks = /* @__PURE__ */ a("ZodPipe", (e, n) => {
  qr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => pi(e, t, r, o), e.in = n.in, e.out = n.out;
});
function Ye(e, n) {
  return new ks({
    type: "pipe",
    in: e,
    out: n
    // ...util.normalizeParams(params),
  });
}
const $s = /* @__PURE__ */ a("ZodReadonly", (e, n) => {
  Hr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => hi(e, t, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Zs(e) {
  return new $s({
    type: "readonly",
    innerType: e
  });
}
const Ss = /* @__PURE__ */ a("ZodCustom", (e, n) => {
  Qr.init(e, n), w.init(e, n), e._zod.processJSONSchema = (t, r, o) => ti(e, t);
});
function Os(e, n = {}) {
  return /* @__PURE__ */ Wo(Ss, e, n);
}
function Es(e) {
  return /* @__PURE__ */ Go(e);
}
const Oe = /^[a-zA-Z0-9-]+$/, Is = /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/, Fn = /^[a-zA-Z][a-zA-Z0-9]*$/, Ts = /^[a-zA-Z0-9.-]+$/, Ps = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?$/, Ns = Fi(), Y = j().regex(Is), Un = j().regex(Oe), xn = j().regex(Oe), As = j().regex(Oe), q = j().regex(Fn), Ee = j().regex(Fn), js = j().regex(Ts), Rs = j().regex(Ps), me = Rn([es(), j().transform((e) => Number.parseFloat(e))]).refine((e) => typeof e == "number" && !Number.isNaN(e) && e >= 1 && e <= 10), Cs = X(["manual", "remote"]), Ds = X(["default"]), Fs = X(["theme", "token", "semantic token"]), Us = X(["lessThan", "equalTo", "greaterThan"]), Jn = I({
  key: js,
  type: Fs
}).readonly(), xs = I({
  url: Ns,
  type: Ds
}).readonly(), qe = I({
  name: Un,
  version: Y,
  type: Cs,
  locked: Se(),
  sources: A(xs).readonly(),
  tokens: A(Jn).readonly()
}).readonly(), Ln = I({
  name: Un,
  version: Y
}).readonly(), Js = I({
  key: q
}).readonly(), Ls = I({
  key: Ee,
  comparisonSourceRef: q.nullable()
}).readonly(), Ms = I({
  token: Jn,
  colorVariableRef: q.nullable(),
  contrastVariableRef: Ee.nullable()
}).readonly();
I({
  name: xn,
  version: Y,
  catalogRefs: A(Ln).readonly(),
  mappings: A(Ms).readonly(),
  colorVariables: A(Js).readonly(),
  contrastVariables: A(Ls).readonly()
}).readonly();
const Vs = I({
  name: xn,
  version: Y
}).readonly(), He = I({
  value: Rs
}).readonly(), Ws = I({
  colorRef: q,
  light: He.nullable(),
  dark: He.nullable(),
  useDarkForLight: Se()
}).readonly(), Qe = I({
  value: me,
  comparisonMethod: Us,
  min: me.nullable(),
  max: me.nullable()
}).readonly(), Gs = I({
  contrastVariableRef: Ee,
  light: Qe.nullable(),
  dark: Qe.nullable(),
  useDarkForLight: Se()
}).readonly();
I({
  name: As,
  version: Y,
  templateRef: Vs,
  idePrimaryColorVariableRef: q,
  colorAssignments: A(Ws).readonly(),
  contrastAssignments: A(Gs).readonly()
}).readonly();
const Bs = "catalogs", Ks = /^(.+)-(\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?)$/;
function Mn(e) {
  return re(e, Bs);
}
function Xs(e, n) {
  return `${e}-${n}.json`;
}
function en(e, n, t) {
  return re(Mn(e), Xs(n, t));
}
function Ys(e) {
  if (!e.endsWith(".json")) return null;
  const n = e.slice(0, -5), t = Ks.exec(n);
  if (!t) return null;
  const [, r, o] = t, i = Ln.safeParse({ name: r, version: o });
  return i.success ? i.data : null;
}
function qs(e) {
  const n = Mn(e);
  return {
    /**
     * Saves a catalog to the filesystem. Validates with catalogSchema and throws on invalid data.
     * Creates the catalogs directory if needed. Overwrites any existing file for the same name and version.
     */
    async saveCatalog(t) {
      const r = qe.safeParse(t);
      if (!r.success) throw new Error("Invalid catalog: " + r.error.message);
      await Xn(n, { recursive: !0 });
      const o = en(e, t.name, t.version);
      await Yn(o, JSON.stringify(r.data, null, 2), "utf-8");
    },
    /**
     * Loads a catalog by name and version. Returns null if the file is missing or data is invalid.
     */
    async loadCatalog(t, r) {
      const o = en(e, t, r);
      try {
        const i = await Kn(o, "utf-8"), s = JSON.parse(i), c = qe.safeParse(s);
        return c.success ? c.data : null;
      } catch {
        return null;
      }
    },
    /**
     * Returns all catalog references by scanning the catalogs directory.
     * Skips files that do not match `<catalogName>-<version>.json` or fail validation.
     */
    async listCatalogs() {
      try {
        const t = await Bn(n, { withFileTypes: !0 }), r = [];
        for (const o of t) {
          if (!o.isFile()) continue;
          const i = Ys(o.name);
          i && r.push(i);
        }
        return r;
      } catch {
        return [];
      }
    }
  };
}
const Hs = {
  name: "new-catalog",
  version: "1.0.0",
  type: "manual",
  locked: !1,
  sources: [],
  tokens: []
};
function Qs() {
  return { ...Hs };
}
const nn = Wn(Gn(import.meta.url));
let V = null;
function ec() {
  const e = G.getPath("userData");
  return qs(e);
}
function tn() {
  V = new rn({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: re(nn, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), process.env.VITE_DEV_SERVER_URL ? V.loadURL(process.env.VITE_DEV_SERVER_URL) : V.loadFile(re(nn, "../dist/index.html")), V.on("closed", () => {
    V = null;
  });
}
G.whenReady().then(() => {
  const e = ec();
  Q.handle("catalog:create", async () => {
    const n = Qs();
    return await e.saveCatalog(n), n;
  }), Q.handle("catalog:save", async (n, t) => {
    await e.saveCatalog(t);
  }), Q.handle("catalog:load", async (n, t, r) => await e.loadCatalog(t, r)), Q.handle("catalog:list", async () => await e.listCatalogs()), tn(), G.on("activate", () => {
    rn.getAllWindows().length === 0 && tn();
  });
});
G.on("window-all-closed", () => {
  process.platform !== "darwin" && G.quit();
});
