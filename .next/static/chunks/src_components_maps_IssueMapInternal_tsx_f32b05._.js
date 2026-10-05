(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_components_maps_IssueMapInternal_tsx_f32b05._.js", {

"[project]/src/components/maps/IssueMapInternal.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>IssueMapInternal)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/react-leaflet/lib/hooks.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/react-leaflet/lib/MapContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/react-leaflet/lib/TileLayer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/react-leaflet/lib/Marker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/react-leaflet/lib/Popup.js [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
'use client';
;
;
;
// Custom SVG Icons by Severity
const getSeverityColor = (severity)=>{
    switch(severity?.toUpperCase()){
        case 'CRITICAL':
            return '#ef4444'; // Red
        case 'HIGH':
            return '#f97316'; // Orange
        case 'MEDIUM':
            return '#f59e0b'; // Yellow
        case 'LOW':
        default:
            return '#10b981'; // Green
    }
};
const createCustomIcon = (severity, pulse = false)=>{
    const color = getSeverityColor(severity);
    const pulseRing = pulse ? `<div style="
        position: absolute;
        top: -8px; left: -8px;
        width: 40px; height: 40px;
        border-radius: 50%;
        background-color: ${color};
        opacity: 0.25;
        animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      "></div>` : '';
    const svgHtml = `
    <div style="position: relative; width: 24px; height: 24px;">
      ${pulseRing}
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1;
      ">
      </div>
    </div>
  `;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
        html: svgHtml,
        className: 'custom-leaflet-marker',
        iconSize: [
            24,
            24
        ],
        iconAnchor: [
            12,
            12
        ],
        popupAnchor: [
            0,
            -20
        ]
    });
};
function MapController({ issues, singleIssue }) {
    _s();
    const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapController.useEffect": ()=>{
            if (singleIssue || issues.length === 1) {
                // For single issue detail view, just set center — don't fitBounds
                return;
            }
            if (issues && issues.length > 1) {
                const bounds = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].latLngBounds(issues.map({
                    "MapController.useEffect.bounds": (i)=>[
                            i.lat,
                            i.lng
                        ]
                }["MapController.useEffect.bounds"]));
                map.fitBounds(bounds, {
                    padding: [
                        40,
                        40
                    ],
                    maxZoom: 15
                });
            }
        }
    }["MapController.useEffect"], [
        issues,
        map,
        singleIssue
    ]);
    return null;
}
_s(MapController, "IoceErwr5KVGS9kN4RQ1bOkYMAg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"]
    ];
});
_c = MapController;
// Inject pulse keyframe CSS once
if ("TURBOPACK compile-time truthy", 1) {
    const styleId = 'leaflet-pulse-ring-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
      @keyframes pulse-ring {
        0% { transform: scale(0.6); opacity: 0.6; }
        80%, 100% { transform: scale(1.8); opacity: 0; }
      }
    `;
        document.head.appendChild(style);
    }
}
function IssueMapInternal({ issues = [], center = [
    37.7749,
    -122.4194
], zoom = 12, height = '500px', singleIssue = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            height,
            width: '100%',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            border: '1px solid #e2e8f0'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$MapContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MapContainer"], {
            center: center,
            zoom: zoom,
            scrollWheelZoom: false,
            style: {
                height: '100%',
                width: '100%'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$TileLayer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TileLayer"], {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }, void 0, false, {
                    fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this),
                issues.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapController, {
                    issues: issues,
                    singleIssue: singleIssue
                }, void 0, false, {
                    fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                    lineNumber: 117,
                    columnNumber: 31
                }, this),
                issues.map((issue)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                        position: [
                            issue.lat,
                            issue.lng
                        ],
                        icon: createCustomIcon(issue.severity, singleIssue),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popup"], {
                            maxWidth: 240,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    minWidth: '200px',
                                    padding: '4px 2px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginBottom: '6px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    backgroundColor: getSeverityColor(issue.severity),
                                                    flexShrink: 0
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                                                lineNumber: 127,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    color: '#64748b',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                },
                                                children: issue.category?.name || 'Issue'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                                                lineNumber: 134,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                                        lineNumber: 126,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            fontSize: '13px',
                                            marginBottom: '4px',
                                            lineHeight: 1.3
                                        },
                                        children: issue.title
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                                        lineNumber: 138,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '11px',
                                            color: '#475569',
                                            marginBottom: '8px'
                                        },
                                        children: [
                                            "📍 ",
                                            issue.address
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                                        lineNumber: 141,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            fontSize: '11px',
                                            color: '#64748b',
                                            paddingTop: '8px',
                                            borderTop: '1px solid #f1f5f9'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    background: '#f1f5f9',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: 500,
                                                    color: '#334155'
                                                },
                                                children: issue.status?.replace(/_/g, ' ')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                                                lineNumber: 145,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: 600,
                                                    color: '#334155'
                                                },
                                                children: [
                                                    "👍 ",
                                                    issue._count?.supports ?? issue.supportCount ?? 0
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                                                lineNumber: 148,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                                        lineNumber: 144,
                                        columnNumber: 17
                                    }, this),
                                    !singleIssue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: `/issues/${issue.id}`,
                                        style: {
                                            marginTop: '10px',
                                            display: 'block',
                                            textAlign: 'center',
                                            background: '#2563eb',
                                            color: 'white',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            padding: '6px',
                                            borderRadius: '6px',
                                            textDecoration: 'none'
                                        },
                                        children: "View Details →"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                                        lineNumber: 151,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                                lineNumber: 125,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                            lineNumber: 124,
                            columnNumber: 13
                        }, this)
                    }, issue.id, false, {
                        fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
                        lineNumber: 119,
                        columnNumber: 11
                    }, this))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
            lineNumber: 112,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/maps/IssueMapInternal.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_c1 = IssueMapInternal;
var _c, _c1;
__turbopack_refresh__.register(_c, "MapController");
__turbopack_refresh__.register(_c1, "IssueMapInternal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_components_maps_IssueMapInternal_tsx_f32b05._.js.map