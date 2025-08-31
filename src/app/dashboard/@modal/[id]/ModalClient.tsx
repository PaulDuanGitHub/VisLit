"use client";

import AvgSentenceLength from "@/components/viz/modals/AvgSentenceLength";
import AvgWordCountByYearModal from "@/components/viz/modals/AvgWordCountByYearModal"
import CanadaHeatMapModal from "@/components/viz/modals/CanadaHeatMapModal";
import FleschReadingEase from "@/components/viz/modals/FleschReadingEase";
import SmogIndex from "@/components/viz/modals/SmogIndex";
import TextStandard from "@/components/viz/modals/TextStandard";
import TopWordsByYearModal from "@/components/viz/modals/TopWordsByYearModal"
import { usePathname  } from "next/navigation";

export default function ModalClient({ id }: { id: string }) {
  const vizId = id || usePathname().split("/").pop() || "";

  switch (vizId) {
    case "changing-length-canadian-literature":
     return <AvgWordCountByYearModal />
    case "most-common-word-canadian-literature":
      return <TopWordsByYearModal />
    case "cities-in-canadian-literature":
      return <CanadaHeatMapModal />
    case "changing-sentence-length-canadian-literature":
      return <AvgSentenceLength />
    case "smog-index-canadian-literature":
      return <SmogIndex />
    case "flesch-reading-ease-canadian-literature":
      return <FleschReadingEase />
    case "avg-text-standard-by-year-canadian-literature":
      return <TextStandard />
    default:
      return <></>
  }
}