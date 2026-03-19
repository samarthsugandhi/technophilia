module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/mongodb.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
}
let cached = /*TURBOPACK member replacement*/ __turbopack_context__.g.mongoose;
if (!cached) {
    cached = /*TURBOPACK member replacement*/ __turbopack_context__.g.mongoose = {
        conn: null,
        promise: null
    };
}
async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false
        };
        cached.promise = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].connect(MONGODB_URI, opts).then((mongoose)=>{
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
const __TURBOPACK__default__export__ = connectDB;
}),
"[project]/src/models/Team.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const teamSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].Schema({
    teamName: {
        type: String,
        required: true
    },
    registrationId: {
        type: String,
        required: true,
        unique: true
    },
    qrCode: {
        type: String
    },
    leader: {
        name: {
            type: String,
            required: true
        },
        usn: {
            type: String,
            required: true
        },
        semester: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        branch: {
            type: String,
            required: true
        },
        stayType: {
            type: String,
            required: true,
            enum: [
                'Local',
                'Hostel'
            ]
        },
        hostelName: {
            type: String
        } // optional, only if stayType === 'Hostel'
    },
    members: {
        type: [
            {
                name: {
                    type: String,
                    required: true
                },
                semester: {
                    type: String,
                    required: true
                },
                usn: {
                    type: String,
                    required: true
                },
                email: {
                    type: String,
                    required: true
                },
                branch: {
                    type: String,
                    required: true
                },
                stayType: {
                    type: String,
                    required: true,
                    enum: [
                        'Local',
                        'Hostel'
                    ]
                },
                hostelName: {
                    type: String
                }
            }
        ],
        validate: [
            arrayLimit,
            '{PATH} must have exactly 2 members'
        ]
    },
    attendanceMarked: {
        type: Boolean,
        default: false
    },
    shortlisted: {
        type: Boolean,
        default: false
    },
    winner: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
function arrayLimit(val) {
    return val.length === 2;
}
// Global Uniqueness Check
teamSchema.pre('save', async function(next) {
    const usns = [
        this.leader.usn,
        ...this.members.map((m)=>m.usn)
    ];
    const emails = [
        this.leader.email,
        ...this.members.map((m)=>m.email)
    ];
    // Check internal uniqueness
    if (new Set(usns).size !== usns.length) {
        const e = new Error("Duplicate USN/CSN in this team. Please change and retry.");
        e.status = 409;
        throw e;
    }
    if (new Set(emails).size !== emails.length) {
        const e = new Error("Duplicate email in this team. Please change and retry.");
        e.status = 409;
        throw e;
    }
    // Check global DB uniqueness
    const existingUSN = await __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Team.findOne({
        $or: [
            {
                "leader.usn": {
                    $in: usns
                }
            },
            {
                "members.usn": {
                    $in: usns
                }
            }
        ],
        _id: {
            $ne: this._id
        } // skip self on updates
    });
    if (existingUSN) {
        const e = new Error("USN/CSN already registered globally. Please change and retry.");
        e.status = 409;
        throw e;
    }
    const existingEmail = await __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Team.findOne({
        $or: [
            {
                "leader.email": {
                    $in: emails
                }
            },
            {
                "members.email": {
                    $in: emails
                }
            }
        ],
        _id: {
            $ne: this._id
        }
    });
    if (existingEmail) {
        const e = new Error("Email already registered globally. Please change and retry.");
        e.status = 409;
        throw e;
    }
    next();
});
const Team = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Team || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model('Team', teamSchema);
const __TURBOPACK__default__export__ = Team;
}),
"[project]/src/app/api/public/live/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mongodb.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Team$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/models/Team.js [app-route] (ecmascript)");
;
;
;
const dynamic = 'force-dynamic';
async function GET() {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const shortlisted = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Team$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({
            shortlisted: true
        }).select('teamName leader.branch').sort({
            updatedAt: -1
        });
        const winners = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$models$2f$Team$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({
            winner: true
        }).select('teamName leader.branch members leader.name').sort({
            updatedAt: -1
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            shortlisted,
            winners
        }, {
            status: 200
        });
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch live data"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0n_2-0d._.js.map