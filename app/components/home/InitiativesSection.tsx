"use client";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import InitiativeCard from "./InitiativeCard";

const tabs = [
  { name: "Top Performance", key: "top" },
  { name: "Récentes", key: "recent" },
  { name: "Tendances", key: "trend" },
];

export default function InitiativesSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Initiatives territoriales qui performent</h2>
        <p className="mb-8 text-gray-600">Découvrez les initiatives les plus impactantes, documentées avec métriques et retours d’expérience pour faciliter leur adaptation</p>
        <TabGroup>
          <TabList className="flex gap-4 mb-6">
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                className={({ selected }) =>
                  `px-4 py-2 rounded ${selected ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-700"}`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <InitiativeCard />
              <InitiativeCard />
              <InitiativeCard />
            </TabPanel>
            <TabPanel>
              <InitiativeCard />
            </TabPanel>
            <TabPanel>
              <InitiativeCard />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </section>
  );
}