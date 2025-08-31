import React from "react";
import ModalClient from "./ModalClient";

interface ModalPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateStaticParams() {
  return [
    { id: "changing-length-canadian-literature" },
    { id: "most-common-word-canadian-literature" },
    { id: "cities-in-canadian-literature" },
    { id: "changing-sentence-length-canadian-literature" },
    { id: "smog-index-canadian-literature" },
    { id: "flesch-reading-ease-canadian-literature" },
    { id: "avg-text-standard-by-year-canadian-literature" },
  ];
}

export default async function ModalPage({ params }: ModalPageProps) {
  const { id } = await params
  return <ModalClient id={id} />
}