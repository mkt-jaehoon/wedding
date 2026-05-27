"use client";

import { useState } from "react";
import type { GuestInput, Leg, TimeBand, TrainType } from "@/lib/types";
import { inboundStations, outboundStations } from "@/lib/wedding";
import { TIME_BAND_META, TIME_BAND_ORDER } from "@/lib/labels";
import { cn } from "./ui";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-400">{hint}</span>}
    </label>
  );
}

function TrainTypeToggle({
  value,
  onChange,
  direction,
}: {
  value: TrainType;
  onChange: (t: TrainType) => void;
  direction: "out" | "in";
}) {
  const types: TrainType[] = ["SRT", "KTX"];
  return (
    <div className="flex gap-2">
      {types.map((t) => {
        const stations =
          direction === "out" ? outboundStations(t) : inboundStations(t);
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
              active
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
            )}
          >
            <span className="font-bold">{t}</span>
            <span
              className={cn(
                "ml-1.5 text-xs",
                active ? "text-zinc-300" : "text-zinc-400",
              )}
            >
              {stations.from} → {stations.to}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TimeBandSelect({
  value,
  onChange,
}: {
  value: TimeBand;
  onChange: (b: TimeBand) => void;
}) {
  return (
    <select
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value as TimeBand)}
    >
      {TIME_BAND_ORDER.map((b) => (
        <option key={b} value={b}>
          {TIME_BAND_META[b].label} ({TIME_BAND_META[b].range})
        </option>
      ))}
    </select>
  );
}

export function GuestForm({
  onSubmit,
}: {
  onSubmit: (input: GuestInput) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [groupName, setGroupName] = useState("");
  const [partySize, setPartySize] = useState(1);

  const [outType, setOutType] = useState<TrainType>("SRT");
  const [outDate, setOutDate] = useState("2027-05-22");
  const [outBand, setOutBand] = useState<TimeBand>("EARLY_AM");

  const [hasReturn, setHasReturn] = useState(false);
  const [inType, setInType] = useState<TrainType>("SRT");
  const [inDate, setInDate] = useState("2027-05-22");
  const [inBand, setInBand] = useState<TimeBand>("EVENING");

  const [memo, setMemo] = useState("");
  const [publicVisible, setPublicVisible] = useState(true);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("이름을 입력해 주세요.");
    if (partySize < 1) return setError("인원은 1명 이상이어야 합니다.");
    if (!privacyAgreed)
      return setError("개인정보 노출 안내에 동의해 주세요.");

    const outbound: Leg = {
      date: outDate,
      timeBand: outBand,
      trainType: outType,
      ...outboundStations(outType),
    };
    const inbound: Leg | undefined = hasReturn
      ? {
          date: inDate,
          timeBand: inBand,
          trainType: inType,
          ...inboundStations(inType),
        }
      : undefined;

    setSubmitting(true);
    try {
      await onSubmit({
        name,
        phone,
        groupName,
        partySize,
        outbound,
        hasReturn,
        inbound,
        memo,
        publicVisible,
        privacyAgreed,
      });
    } catch {
      setError("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="이름" required>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
          />
        </Field>
        <Field label="연락처" hint="관리자만 확인합니다 (공개되지 않음)">
          <input
            className={inputCls}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-1234-5678"
            inputMode="tel"
          />
        </Field>
        <Field label="소속 / 관계" hint="예: 신랑 대학동기">
          <input
            className={inputCls}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="신랑 친구"
          />
        </Field>
        <Field label="총 인원 (본인 포함)" required>
          <input
            type="number"
            min={1}
            className={inputCls}
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
          />
        </Field>
      </div>

      {/* 가는편 */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">
          가는편 (서울권 → 부산)
        </h3>
        <div className="space-y-3">
          <TrainTypeToggle value={outType} onChange={setOutType} direction="out" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="출발일">
              <input
                type="date"
                className={inputCls}
                value={outDate}
                onChange={(e) => setOutDate(e.target.value)}
              />
            </Field>
            <Field label="선호 시간대">
              <TimeBandSelect value={outBand} onChange={setOutBand} />
            </Field>
          </div>
        </div>
      </div>

      {/* 오는편 */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300"
            checked={hasReturn}
            onChange={(e) => setHasReturn(e.target.checked)}
          />
          <span className="text-sm font-semibold text-zinc-900">
            오는편 (부산 → 서울권)도 신청
          </span>
        </label>
        {hasReturn && (
          <div className="mt-3 space-y-3">
            <TrainTypeToggle value={inType} onChange={setInType} direction="in" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="복귀일">
                <input
                  type="date"
                  className={inputCls}
                  value={inDate}
                  onChange={(e) => setInDate(e.target.value)}
                />
              </Field>
              <Field label="선호 시간대">
                <TimeBandSelect value={inBand} onChange={setInBand} />
              </Field>
            </div>
          </div>
        )}
      </div>

      <Field label="요청 사항 (선택)" hint="좌석 선호, 동행 정보 등 — 관리자만 확인">
        <textarea
          className={cn(inputCls, "min-h-20 resize-y")}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 통로측 선호, 어린이 1명 포함"
        />
      </Field>

      {/* 개인정보 */}
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-zinc-300"
            checked={publicVisible}
            onChange={(e) => setPublicVisible(e.target.checked)}
          />
          <span className="text-sm text-zinc-700">
            다른 하객의 <b>이동 현황</b>에 내 정보를 노출합니다 (동행 안내용)
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-zinc-300"
            checked={privacyAgreed}
            onChange={(e) => setPrivacyAgreed(e.target.checked)}
          />
          <span className="text-xs leading-relaxed text-zinc-600">
            입력하신 정보 중 <b>성함 일부(마스킹), 이용 노선, 출발일, 시간대,
            예매 상태</b>는 다른 하객의 이동 현황 확인을 위해 노출될 수 있습니다.
            <b>연락처 및 상세 개인정보는 공개되지 않습니다.</b> 위 내용에
            동의합니다.
          </span>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {submitting ? "저장 중…" : "탑승 신청 제출"}
      </button>
    </form>
  );
}
