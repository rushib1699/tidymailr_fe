
// import { useState, useEffect, useMemo } from "react";
// import { useApp } from "../context/AppContext";
// import { plans } from "../services/api";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Loader2, Calendar, Search } from "lucide-react";
// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";
// import timezone from "dayjs/plugin/timezone";

// dayjs.extend(utc);
// dayjs.extend(timezone);

// interface PlanItem {
//   type: string;
//   notes?: string;
//   start: string;
//   title: string;
//   duration_minutes: number;
// }

// export default function PlansPage() {
//   const { state, actions } = useApp();
//   const [allPlans, setAllPlans] = useState<PlanItem[]>([]);
//   const [filteredPlans, setFilteredPlans] = useState<PlanItem[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Filters
//   const [selectedType, setSelectedType] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

//   // Plan timezone (defaults if not provided in payload)
//   const [planTz, setPlanTz] = useState("America/New_York");

//   useEffect(() => {
//     loadPlans(selectedDate);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedDate]);

//   useEffect(() => {
//     filterPlans();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [allPlans, selectedType, searchQuery]);

//   const loadPlans = async (date: string): Promise<void> => {
//     try {
//       if (!state.user?.id) {
//         setAllPlans([]);
//         return;
//       }
//       setIsLoading(true);
//       const response = await plans.getPlans({
//         user_id: state.user.id,
//         date,
//       });

//       if (Array.isArray(response) && response.length > 0) {
//         const parsed = JSON.parse(response[0].plan || "{}");
//         const items: PlanItem[] = parsed.plan || [];
//         setAllPlans(items);
//         setPlanTz(parsed.tz || "America/New_York");
//       } else {
//         setAllPlans([]);
//         setPlanTz("America/New_York");
//       }
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Unknown error";
//       actions.setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const filterPlans = () => {
//     let filtered = [...allPlans];

//     if (selectedType !== "all") {
//       filtered = filtered.filter(
//         (plan) => plan.type.toLowerCase() === selectedType.toLowerCase()
//       );
//     }

//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       filtered = filtered.filter(
//         (plan) =>
//           plan.title.toLowerCase().includes(q) ||
//           (plan.notes && plan.notes.toLowerCase().includes(q))
//       );
//     }

//     // sort by start time asc
//     filtered.sort((a, b) =>
//       dayjs.tz(a.start, planTz).valueOf() - dayjs.tz(b.start, planTz).valueOf()
//     );

//     setFilteredPlans(filtered);
//   };

//   const dateObj = useMemo(() => dayjs(selectedDate), [selectedDate]);
//   const largeDay = dateObj.format("DD");
//   const largeWeekday = dateObj.format("dddd");
//   const monthYear = dateObj.format("MMMM, YYYY");

//   const typeStyle: Record<
//     string,
//     { dot: string; chip: string }
//   > = {
//     followup: {
//       dot: "bg-blue-500 ring-blue-200",
//       chip:
//         "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
//     },
//     meeting: {
//       dot: "bg-purple-500 ring-purple-200",
//       chip:
//         "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
//     },
//     call: {
//       dot: "bg-emerald-500 ring-emerald-200",
//       chip:
//         "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
//     },
//     task: {
//       dot: "bg-amber-500 ring-amber-200",
//       chip:
//         "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
//     },
//   };

//   const chipFor = (t: string) =>
//     typeStyle[t]?.chip || "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
//   const dotFor = (t: string) =>
//     typeStyle[t]?.dot || "bg-slate-400 ring-slate-200";

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="py-4 sm:py-8">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Gradient Hero / Date */}
//         <Card className="overflow-hidden border-0 mb-6 sm:mb-8 shadow-sm">
//           <div className="relative">
//             <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 opacity-90" />
//             <div className="relative px-6 sm:px-8 py-8 sm:py-10 text-white">
//               <div className="flex items-end justify-between gap-6">
//                 <div className="flex items-center gap-6">
//                   <div className="text-6xl sm:text-7xl font-semibold leading-none tracking-tight">
//                     {largeDay}
//                   </div>
//                   <div className="space-y-1">
//                     <div className="text-lg sm:text-xl font-medium">{largeWeekday}</div>
//                     <div className="text-sm/6 opacity-90">{monthYear}</div>
//                     <div className="text-xs/6 opacity-80">
//                       Timezone: {planTz.replace("_", " ")}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Compact date picker */}
//                 <div className="hidden sm:block">
//                   <Label htmlFor="date-filter" className="text-white/90">
//                     Select date
//                   </Label>
//                   <Input
//                     id="date-filter"
//                     type="date"
//                     value={selectedDate}
//                     onChange={(e) => setSelectedDate(e.target.value)}
//                     className="mt-2 bg-white/15 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </Card>

//         {/* Filters bar */}
//         <Card className="mb-6 sm:mb-8 border-muted/40">
//           <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {/* Search */}
//             <div className="space-y-2">
//               <Label htmlFor="search">Search</Label>
//               <div className="relative">
//                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="search"
//                   placeholder="Title or notes"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-8"
//                 />
//               </div>
//             </div>

//             {/* Type Filter */}
//             <div className="space-y-2">
//               <Label htmlFor="type-filter">Type</Label>
//               <Select value={selectedType} onValueChange={setSelectedType}>
//                 <SelectTrigger id="type-filter">
//                   <SelectValue placeholder="Select type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All types</SelectItem>
//                   <SelectItem value="followup">Follow Up</SelectItem>
//                   <SelectItem value="meeting">Meeting</SelectItem>
//                   <SelectItem value="call">Call</SelectItem>
//                   <SelectItem value="task">Task</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Date (mobile) */}
//             <div className="space-y-2 sm:hidden">
//               <Label htmlFor="date-filter-mobile">Date</Label>
//               <Input
//                 id="date-filter-mobile"
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Timeline / List */}
//         {filteredPlans.length === 0 ? (
//           <div className="text-center py-12">
//             <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
//             <h3 className="mt-2 text-sm font-medium">No plans found</h3>
//             <p className="mt-1 text-sm text-muted-foreground">
//               Try adjusting your filters or search.
//             </p>
//           </div>
//         ) : (
//           <Card className="border-muted/40">
//             <CardContent className="p-0">
//               <ul className="relative divide-y">
//                 {/* vertical line */}
//                 <div className="absolute left-6 top-0 bottom-0 w-px bg-muted" />

//                 {filteredPlans.map((item, idx) => {
//                   const start = dayjs.tz(item.start, planTz);
//                   const time = start.format("hh:mm A");
//                   const key = `${item.start}-${idx}`;
//                   return (
//                     <li key={key} className="pl-16 pr-4 sm:pr-6">
//                       <div className="flex gap-4 sm:gap-6 py-4 sm:py-5">
//                         {/* timeline dot */}
//                         <div className="relative">
//                           <span
//                             className={`absolute -left-10 top-2 h-3.5 w-3.5 rounded-full ring-4 ${dotFor(
//                               item.type
//                             )}`}
//                           />
//                         </div>

//                         {/* content */}
//                         <div className="min-w-0 flex-1">
//                           <div className="flex flex-wrap items-center justify-between gap-3">
//                             <div className="flex items-center gap-3">
//                               <span
//                                 className={`text-xs px-2 py-1 rounded-full ${chipFor(
//                                   item.type
//                                 )} capitalize`}
//                               >
//                                 {item.type}
//                               </span>
//                               <h3 className="font-medium text-foreground/90">
//                                 {item.title}
//                               </h3>
//                             </div>

//                             <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
//                               {time} • {item.duration_minutes} min
//                             </div>
//                           </div>

//                           {item.notes && (
//                             <p className="mt-1 text-sm text-muted-foreground">
//                               {item.notes}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useMemo, useRef } from "react";
import { useApp } from "../context/AppContext";
import { plans } from "../services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Calendar, Search } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface PlanItem {
    type: string;
    notes?: string;
    start: string; // ISO or "YYYY-MM-DDTHH:mm"
    title: string;
    duration_minutes: number;
}

type Enhanced = PlanItem & {
    idx: number;
    startAt: dayjs.Dayjs;
    endAt: dayjs.Dayjs;
    col?: number;
    group?: number;
    groupCols?: number;
};

const HOUR_HEIGHT = 64; // px per hour
const GAP_PX = 8;
const MIN_BLOCK_PX = 56;

export default function PlansPage() {
    const { state, actions } = useApp();
    const [allPlans, setAllPlans] = useState<PlanItem[]>([]);
    const [filteredPlans, setFilteredPlans] = useState<PlanItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [selectedType, setSelectedType] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

    // Plan timezone (default)
    const [planTz, setPlanTz] = useState("America/New_York");

    // View mode (default to Day timeline)
    const [view, setView] = useState<"day" | "list">("day");

    useEffect(() => {
        loadPlans(selectedDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    useEffect(() => {
        filterPlans();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allPlans, selectedType, searchQuery]);

    const loadPlans = async (date: string): Promise<void> => {
        try {
            if (!state.user?.id) {
                setAllPlans([]);
                return;
            }
            setIsLoading(true);
            const response = await plans.getPlans({
                user_id: state.user.id,
                date,
            });

            if (Array.isArray(response) && response.length > 0) {
                const parsed = JSON.parse(response[0].plan || "{}");
                const items: PlanItem[] = parsed.plan || [];
                setAllPlans(items);
                setPlanTz(parsed.tz || "America/New_York");
            } else {
                setAllPlans([]);
                setPlanTz("America/New_York");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            actions.setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const filterPlans = () => {
        let filtered = [...allPlans];

        if (selectedType !== "all") {
            filtered = filtered.filter(
                (plan) => plan.type.toLowerCase() === selectedType.toLowerCase()
            );
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (plan) =>
                    plan.title.toLowerCase().includes(q) ||
                    (plan.notes && plan.notes.toLowerCase().includes(q))
            );
        }

        filtered.sort(
            (a, b) =>
                dayjs.tz(a.start, planTz).valueOf() - dayjs.tz(b.start, planTz).valueOf()
        );

        setFilteredPlans(filtered);
    };

    const dateObj = useMemo(() => dayjs(selectedDate), [selectedDate]);
    const largeDay = dateObj.format("DD");
    const largeWeekday = dateObj.format("dddd");
    const monthYear = dateObj.format("MMMM, YYYY");

    const typeStyle: Record<string, { dot: string; chip: string; bg: string; border: string }> = {
        followup: {
            dot: "bg-blue-500 ring-blue-200",
            chip: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
            bg: "bg-blue-50",
            border: "border-blue-200",
        },
        meeting: {
            dot: "bg-purple-500 ring-purple-200",
            chip: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
            bg: "bg-purple-50",
            border: "border-purple-200",
        },
        call: {
            dot: "bg-emerald-500 ring-emerald-200",
            chip: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
        },
        task: {
            dot: "bg-amber-500 ring-amber-200",
            chip: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
            bg: "bg-amber-50",
            border: "border-amber-200",
        },
    };

    const chipFor = (t: string) =>
        typeStyle[t]?.chip || "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
    const dotFor = (t: string) =>
        typeStyle[t]?.dot || "bg-slate-400 ring-slate-200";
    const bgFor = (t: string) => typeStyle[t]?.bg || "bg-slate-50";
    const borderFor = (t: string) => typeStyle[t]?.border || "border-slate-200";

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="py-4 sm:py-8 overflow-x-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Gradient Hero / Date */}
                <Card className="overflow-hidden border-0 mb-6 sm:mb-8 shadow-sm">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 opacity-90" />
                        <div className="relative px-6 sm:px-8 py-8 sm:py-10 text-white">
                            <div className="flex items-end justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="text-6xl sm:text-7xl font-semibold leading-none tracking-tight">
                                        {largeDay}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-lg sm:text-xl font-medium">{largeWeekday}</div>
                                        <div className="text-sm/6 opacity-90">{monthYear}</div>
                                        <div className="text-xs/6 opacity-80">Timezone: {planTz.replace("_", " ")}</div>
                                    </div>
                                </div>

                                {/* View toggle */}
                                <div className="flex items-center gap-2 bg-white/15 rounded-xl p-1">
                                    <button
                                        onClick={() => setView("day")}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition ${view === "day" ? "bg-white/90 text-emerald-700" : "text-white/90 hover:bg-white/10"
                                            }`}
                                        aria-pressed={view === "day"}
                                    >
                                        Day
                                    </button>
                                    <button
                                        onClick={() => setView("list")}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition ${view === "list" ? "bg-white/90 text-emerald-700" : "text-white/90 hover:bg-white/10"
                                            }`}
                                        aria-pressed={view === "list"}
                                    >
                                        List
                                    </button>
                                </div>
                            </div>

                            {/* Desktop date picker */}
                            <div className="mt-6 hidden sm:block">
                                <Label htmlFor="date-filter" className="text-white/90">
                                    Select date
                                </Label>
                                <Input
                                    id="date-filter"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="mt-2 bg-white/15 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Filters */}
                <Card className="mb-6 sm:mb-8 border-muted/40">
                    <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Title or notes"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        {/* Type */}
                        <div className="space-y-2">
                            <Label htmlFor="type-filter">Type</Label>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger id="type-filter">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    <SelectItem value="followup">Follow Up</SelectItem>
                                    <SelectItem value="meeting">Meeting</SelectItem>
                                    <SelectItem value="call">Call</SelectItem>
                                    <SelectItem value="task">Task</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Mobile date */}
                        <div className="space-y-2 sm:hidden">
                            <Label htmlFor="date-filter-mobile">Date</Label>
                            <Input
                                id="date-filter-mobile"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Views */}
                {view === "list" ? (
                    filteredPlans.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <ListView
                            items={filteredPlans}
                            tz={planTz}
                            chipFor={chipFor}
                            dotFor={dotFor}
                        />
                    )
                ) : filteredPlans.length === 0 ? (
                    <EmptyState />
                ) : (
                    <DayTimeline
                        items={filteredPlans}
                        tz={planTz}
                        styles={{ chipFor, dotFor, bgFor, borderFor }}
                        dateISO={selectedDate}
                    />
                )}
            </div>
        </div>
    );
}

/* ---------- Subviews ---------- */

function EmptyState() {
    return (
        <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No plans found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or search.
            </p>
        </div>
    );
}

function ListView({
    items,
    tz,
    chipFor,
    dotFor,
}: {
    items: PlanItem[];
    tz: string;
    chipFor: (t: string) => string;
    dotFor: (t: string) => string;
}) {
    return (
        <Card className="border-muted/40">
            <CardContent className="p-0">
                <ul className="relative divide-y">
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-muted" />
                    {items.map((item, idx) => {
                        const start = dayjs.tz(item.start, tz);
                        const time = start.format("hh:mm A");
                        return (
                            <li key={`${item.start}-${idx}`} className="pl-16 pr-4 sm:pr-6">
                                <div className="flex gap-4 sm:gap-6 py-4 sm:py-5">
                                    <div className="relative">
                                        <span
                                            className={`absolute -left-10 top-2 h-3.5 w-3.5 rounded-full ring-4 ${dotFor(
                                                item.type
                                            )}`}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${chipFor(item.type)} capitalize`}>
                                                    {item.type}
                                                </span>
                                                <h3 className="font-medium text-foreground/90">{item.title}</h3>
                                            </div>
                                            <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                                {time} • {item.duration_minutes} min
                                            </div>
                                        </div>
                                        {item.notes && (
                                            <p className="mt-1 text-sm text-muted-foreground">{item.notes}</p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
}

/* ---------- Day timeline (calendar-like) ---------- */

function DayTimeline({
    items,
    tz,
    styles,
    dateISO,
}: {
    items: PlanItem[];
    tz: string;
    styles: {
        chipFor: (t: string) => string;
        dotFor: (t: string) => string;
        bgFor: (t: string) => string;
        borderFor: (t: string) => string;
    };
    dateISO: string;
}) {
    const PX_PER_MIN = HOUR_HEIGHT / 60;
    const isTodayInTz = dayjs().tz(tz).format("YYYY-MM-DD") === dateISO;
    const containerRef = useRef<HTMLDivElement>(null);

    // enhance + overlap layout
    const enhanced: Enhanced[] = useMemo(() => {
        const arr: Enhanced[] = items.map((p, idx) => {
            const startAt = dayjs.tz(p.start, tz);
            const endAt = startAt.add(Math.max(p.duration_minutes, 1), "minute");
            return { ...p, idx, startAt, endAt };
        });

        // sort
        arr.sort((a, b) => a.startAt.valueOf() - b.startAt.valueOf());

        // sweep-line to assign columns/groups
        let active: Enhanced[] = [];
        let groupId = 0;

        for (const ev of arr) {
            active = active.filter((e) => e.endAt.valueOf() > ev.startAt.valueOf());
            if (active.length === 0) groupId += 1;
            ev.group = groupId;

            const used = new Set(active.map((e) => e.col ?? 0));
            let col = 0;
            while (used.has(col)) col += 1;
            ev.col = col;
            active.push(ev);
        }

        // compute groupCols
        const groupMax: Record<number, number> = {};
        for (const ev of arr) {
            const cols = Math.max(groupMax[ev.group! as number] ?? 0, (ev.col ?? 0) + 1);
            groupMax[ev.group! as number] = cols;
        }
        for (const ev of arr) ev.groupCols = groupMax[ev.group! as number];

        return arr;
    }, [items, tz]);

    // derive window (loose: pad 1h start/end; clamp 6–22 if empty)
    const window = useMemo(() => {
        if (enhanced.length === 0) {
            return { startMin: 6 * 60, endMin: 22 * 60 };
        }
        const minStart = Math.min(...enhanced.map((e) => e.startAt.hour() * 60 + e.startAt.minute()));
        const maxEnd = Math.max(...enhanced.map((e) => e.endAt.hour() * 60 + e.endAt.minute()));
        const startMin = Math.max(0, Math.floor((minStart - 60) / 60) * 60);
        const endMin = Math.min(1440, Math.ceil((maxEnd + 60) / 60) * 60);
        return { startMin, endMin };
    }, [enhanced]);

    const hours = useMemo(() => {
        const out: number[] = [];
        for (let m = window.startMin; m <= window.endMin; m += 60) out.push(m / 60);
        return out;
    }, [window]);

    // auto-scroll to "now"
    useEffect(() => {
        if (!isTodayInTz || !containerRef.current) return;
        const el = containerRef.current;

        const scrollToNow = () => {
            const now = dayjs().tz(tz);
            const minutes = now.hour() * 60 + now.minute();
            const y = (minutes - window.startMin) * PX_PER_MIN - 120;
            el.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        };

        scrollToNow();
        const id = setInterval(scrollToNow, 60_000);
        return () => clearInterval(id);
    }, [isTodayInTz, tz, window.startMin, PX_PER_MIN]);

    return (
        <Card className="border-muted/40">
            <CardContent className="p-0">
                <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[72px_1fr]">
                    {/* Hour labels */}
                    <div className="relative border-r bg-muted/10">
                        <div
                            style={{ height: (window.endMin - window.startMin) * PX_PER_MIN }}
                            className="relative"
                        >
                            {hours.map((h) => {
                                const top = (h * 60 - window.startMin) * PX_PER_MIN;
                                return (
                                    <div key={h} className="absolute left-0 right-0" style={{ top }}>
                                        <div className="text-xs text-muted-foreground px-2 -translate-y-2 select-none">
                                            {dayjs().hour(h).minute(0).format("h A")}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Timeline rail */}
                    <div
                        ref={containerRef}
                        className="relative max-h-[70vh] overflow-y-auto overflow-x-hidden min-w-0"
                    >
                        <div
                            style={{ height: (window.endMin - window.startMin) * PX_PER_MIN }}
                            className="relative"
                        >
                            {/* hour grid */}
                            {hours.map((h) => {
                                const top = (h * 60 - window.startMin) * PX_PER_MIN;
                                return (
                                    <div
                                        key={h}
                                        className="absolute left-0 right-0 border-t border-dashed border-muted"
                                        style={{ top }}
                                    />
                                );
                            })}

                            {/* now indicator */}
                            {isTodayInTz && (() => {
                                const now = dayjs().tz(tz);
                                const nowMin = now.hour() * 60 + now.minute();
                                if (nowMin < window.startMin || nowMin > window.endMin) return null;
                                const top = (nowMin - window.startMin) * PX_PER_MIN;
                                return (
                                    <div
                                        className="absolute left-0 right-0"
                                        style={{ top }}
                                        aria-label="Current time"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
                                            <div className="h-px flex-1 bg-rose-600/70" />
                                            <span className="text-[10px] text-rose-700 pr-2">
                                                {now.format("h:mm A")}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}
                            {/* events (gap-aware, clamped, title-safe) */}
                            {enhanced.map((e) => {
                                const startMin = e.startAt.hour() * 60 + e.startAt.minute();
                                const endMin = e.endAt.hour() * 60 + e.endAt.minute();

                                // clamp to the visible window
                                const visStart = Math.max(startMin, window.startMin);
                                const visEnd = Math.min(endMin, window.endMin);
                                const durationMin = Math.max(visEnd - visStart, 1);

                                const top = (visStart - window.startMin) * PX_PER_MIN;
                                const height = Math.max(durationMin * PX_PER_MIN, MIN_BLOCK_PX);

                                // overlap columns with real gap pixels
                                const cols = Math.max(e.groupCols ?? 1, 1);
                                const col = Math.min(e.col ?? 0, cols - 1);
                                const totalGap = (cols - 1) * GAP_PX;
                                const width = `calc((100% - ${totalGap}px) / ${cols})`;
                                const left = `calc(${col} * ( (100% - ${totalGap}px) / ${cols} + ${GAP_PX}px ))`;

                                // condensed layout when the block is short
                                const isTight = height < 72; // ~45–60 min or clamped
                                const pad = isTight ? "p-2" : "p-3";

                                return (
                                    <div
                                        key={e.idx}
                                        className={`absolute box-border rounded-xl ${styles.bgFor(e.type)} ${styles.borderFor(e.type)} border shadow-sm ${pad} overflow-hidden`}
                                        style={{ top, left, width, height }}
                                    >
                                        {/* top row: chip + TITLE (always visible) + time */}
                                        <div className="flex items-center justify-between gap-2 min-w-0">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${styles.chipFor(e.type)} capitalize shrink-0`}>
                                                    {e.type}
                                                </span>
                                                <div className={`font-medium min-w-0 ${isTight ? "text-xs truncate" : "text-sm leading-snug line-clamp-2"}`}>
                                                    {e.title}
                                                </div>
                                            </div>
                                            <span className={`text-[11px] text-muted-foreground shrink-0 ${isTight ? "hidden sm:inline" : ""}`}>
                                                {e.startAt.format("h:mm A")} • {e.duration_minutes}m
                                            </span>
                                        </div>

                                        {/* notes only when space allows */}
                                        {!isTight && e.notes && (
                                            <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                                {e.notes}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
