import reportData from '../../mock-report-output.json';
import type { NagDashboardReport } from '../types/uiComponents.js';
import { DASHBOARD_LAYOUT } from './dashboardLayout.js';
import {
  renderComponent,
  sectionClass,
  sectionTitleClass,
} from './components/renderComponent.js';

const report = reportData as NagDashboardReport;

export default function App() {
  const { view } = report;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-10">
        {DASHBOARD_LAYOUT.map((section) => (
          <section
            key={section.sectionId}
            id={section.sectionId}
            className={sectionClass(section.sectionId)}
          >
            <h2 className={sectionTitleClass(section.sectionId)}>
              {section.title}
            </h2>
            {section.components.map((slot) => (
              <div key={slot.componentId}>
                {renderComponent(slot.componentId, view, slot.dataKey)}
              </div>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
