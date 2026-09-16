import { useEffect, useMemo, useState } from "react";

import {
  IndiaMap as IndiaSvgMap,
} from "@vishalvoid/react-india-map";

import "./IndiaMap.css";


/*
 * ============================================================
 * INDIA MAP STATE / UT DEFINITIONS
 * ============================================================
 *
 * mapId       = ID used by the SVG library
 * databaseCode = code used by our PostgreSQL states table
 * mapName     = fallback name if database data is unavailable
 *
 */

const MAP_STATES = [
  ["IN-AP", "AP", "Andhra Pradesh"],
  ["IN-AR", "AR", "Arunachal Pradesh"],
  ["IN-AS", "AS", "Assam"],
  ["IN-BR", "BR", "Bihar"],
  ["IN-CT", "CG", "Chhattisgarh"],
  ["IN-GA", "GA", "Goa"],
  ["IN-GJ", "GJ", "Gujarat"],
  ["IN-HR", "HR", "Haryana"],
  ["IN-HP", "HP", "Himachal Pradesh"],
  ["IN-JH", "JH", "Jharkhand"],
  ["IN-KA", "KA", "Karnataka"],
  ["IN-KL", "KL", "Kerala"],
  ["IN-MP", "MP", "Madhya Pradesh"],
  ["IN-MH", "MH", "Maharashtra"],
  ["IN-MN", "MN", "Manipur"],
  ["IN-ML", "ML", "Meghalaya"],
  ["IN-MZ", "MZ", "Mizoram"],
  ["IN-NL", "NL", "Nagaland"],
  ["IN-OR", "OD", "Odisha"],
  ["IN-PB", "PB", "Punjab"],
  ["IN-RJ", "RJ", "Rajasthan"],
  ["IN-SK", "SK", "Sikkim"],
  ["IN-TN", "TN", "Tamil Nadu"],
  ["IN-TG", "TS", "Telangana"],
  ["IN-TR", "TR", "Tripura"],
  ["IN-UP", "UP", "Uttar Pradesh"],
  ["IN-UT", "UK", "Uttarakhand"],
  ["IN-WB", "WB", "West Bengal"],

  // Union Territories
  ["IN-AN", "AN", "Andaman and Nicobar Islands"],
  ["IN-CH", "CH", "Chandigarh"],
  ["IN-DN", "DN", "Dadra and Nagar Haveli and Daman and Diu"],
  ["IN-DL", "DL", "Delhi"],
  ["IN-JK", "JK", "Jammu and Kashmir"],
  ["IN-LA", "LA", "Ladakh"],
  ["IN-LD", "LD", "Lakshadweep"],
  ["IN-PY", "PY", "Puducherry"],
];


/*
 * ============================================================
 * DATABASE CODE NORMALIZATION
 * ============================================================
 */

function normalizeCode(code) {
  if (!code) {
    return "";
  }

  const normalized = code
    .trim()
    .toUpperCase();

  const aliases = {
    TG: "TS",
    TS: "TS",

    OR: "OD",
    OD: "OD",

    CT: "CG",
    CG: "CG",

    UT: "UK",
    UK: "UK",
  };

  return aliases[normalized] || normalized;
}


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function IndiaMap({
  states = [],
  selectedState,
  onStateSelect,
}) {
  const [hoveredState, setHoveredState] = useState(null);


  /*
   * ==========================================================
   * DATABASE STATE LOOKUP
   * ==========================================================
   */

  const databaseStateByCode = useMemo(() => {
    const lookup = {};

    states.forEach((state) => {
      const code = normalizeCode(state.code);

      if (code) {
        lookup[code] = state;
      }
    });

    return lookup;
  }, [states]);


  /*
   * ==========================================================
   * MAP DATA
   * ==========================================================
   *
   * IMPORTANT:
   *
   * We render ALL India states + UTs even if PostgreSQL
   * does not currently contain cultural data for them.
   *
   */

  const stateData = useMemo(() => {
    return MAP_STATES.map(
      ([mapId, databaseCode, mapName]) => {
        const databaseState =
          databaseStateByCode[databaseCode];

        return {
          id: mapId,

          customData: {
            databaseId:
              databaseState?.id || null,

            name:
              databaseState?.name || mapName,

            code:
              databaseState?.code ||
              databaseCode,

            description:
              databaseState?.description || "",
          },
        };
      }
    );
  }, [databaseStateByCode]);


  /*
   * ==========================================================
   * SELECTED STATE
   * ==========================================================
   */

  const selectedMapId = useMemo(() => {
    if (!selectedState) {
      return "";
    }

    const code = normalizeCode(
      selectedState.code
    );

    const found = MAP_STATES.find(
      ([, databaseCode]) =>
        databaseCode === code
    );

    return found ? found[0] : "";
  }, [selectedState]);


  /*
   * ==========================================================
   * IMPORTANT SVG FIX
   * ==========================================================
   *
   * The library's SVG is generated with:
   *
   * width  = 611.85999
   * height = 695.70178
   *
   * but it does not provide a standard viewBox.
   *
   * Without viewBox, CSS resizing can make the SVG appear
   * enormous or clip the southern part of India.
   *
   * We add the correct viewBox AFTER the library renders
   * the SVG.
   *
   */

  useEffect(() => {
    const normalizeSvg = () => {
      const wrapper =
        document.querySelector(
          ".india-map-stage .india-map-container"
        );

      if (!wrapper) {
        return;
      }

      const svg =
        wrapper.querySelector("svg");

      if (!svg) {
        return;
      }

      /*
       * The original SVG dimensions from the library.
       */
      svg.setAttribute(
        "viewBox",
        "0 0 611.85999 695.70178"
      );

      /*
       * Preserve the complete map.
       *
       * "meet" means the entire SVG must fit inside
       * the available box instead of being cropped.
       */
      svg.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
      );

      /*
       * Remove the original fixed dimensions.
       * CSS will control the display size.
       */
      svg.removeAttribute("width");
      svg.removeAttribute("height");

      /*
       * Extra protection against SVG overflow.
       */
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.maxWidth = "100%";
      svg.style.maxHeight = "100%";
      svg.style.display = "block";
      svg.style.objectFit = "contain";
    };


    /*
     * The library loads the SVG asynchronously,
     * so run once immediately and again shortly after.
     */

    normalizeSvg();

    const timer1 =
      setTimeout(
        normalizeSvg,
        100
      );

    const timer2 =
      setTimeout(
        normalizeSvg,
        300
      );

    const timer3 =
      setTimeout(
        normalizeSvg,
        600
      );

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [states]);


  /*
   * ==========================================================
   * HOVER
   * ==========================================================
   */

  function handleStateHover(
    stateId,
    stateInfo
  ) {
    const found =
      stateData.find(
        (state) =>
          state.id === stateId
      );

    if (found) {
      setHoveredState(found);
    } else {
      setHoveredState(
        stateInfo || null
      );
    }
  }


  /*
   * ==========================================================
   * CLICK
   * ==========================================================
   */

  function handleStateClick(
    stateId,
    stateInfo
  ) {
    const found =
      stateData.find(
        (state) =>
          state.id === stateId
      );

    if (!found) {
      return;
    }

    onStateSelect?.(
      found.customData,
      stateInfo
    );
  }


  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="india-map-wrapper">

      <div className="india-map-stage">

        <IndiaSvgMap
          stateData={stateData}

          onStateHover={
            handleStateHover
          }

          onStateClick={
            handleStateClick
          }

          mapStyle={{
            backgroundColor:
              "#dcecf7",

            hoverColor:
              "#287eb4",

            stroke:
              "#ffffff",

            strokeWidth:
              1.2,

            tooltipConfig: {
              backgroundColor:
                "#123b60",

              textColor:
                "#ffffff",
            },
          }}
        />


        {/* ==================================================
            SELECTED STATE INDICATOR
            ================================================== */}

        {selectedMapId && (
          <div
            className="selected-state-indicator"
          >
            <span
              className="selected-state-dot"
            />

            <span>
              {selectedState.name}
            </span>
          </div>
        )}


        {/* ==================================================
            HOVER CARD
            ================================================== */}

        {hoveredState && (
          <div
            className="map-hover-card"
          >
            <strong>
              {
                hoveredState
                  .customData
                  ?.name
              }
            </strong>

            <span>
              {
                hoveredState
                  .customData
                  ?.code
              }
            </span>

            <small>
              Click to explore
            </small>
          </div>
        )}

        {/* =================================================
    ISLAND TERRITORIES
    ================================================= */}

<div className="island-territories">

  <div className="island-territories-header">
    <span className="island-icon">🏝️</span>

    <div>
      <strong>Island Territories</strong>
      <small>Explore India's islands</small>
    </div>
  </div>


  {/* Lakshadweep */}

  {(() => {
    const lakshadweep =
      stateData.find(
        (state) =>
          state.id === "IN-LD"
      );

    if (!lakshadweep) {
      return null;
    }

    return (
      <button
        type="button"
        className={
          `island-territory-button ${
            selectedMapId === "IN-LD"
              ? "active"
              : ""
          }`
        }
        onClick={() =>
          onStateSelect?.(
            lakshadweep.customData
          )
        }
      >

        <span className="island-marker">
          •
        </span>

        <span className="island-territory-info">

          <strong>
            Lakshadweep
          </strong>

          <small>
            Union Territory
          </small>

        </span>

        <span className="island-arrow">
          →
        </span>

      </button>
    );
  })()}


  {/* Andaman & Nicobar */}

  {(() => {
    const andaman =
      stateData.find(
        (state) =>
          state.id === "IN-AN"
      );

    if (!andaman) {
      return null;
    }

    return (
      <button
        type="button"
        className={
          `island-territory-button ${
            selectedMapId === "IN-AN"
              ? "active"
              : ""
          }`
        }
        onClick={() =>
          onStateSelect?.(
            andaman.customData
          )
        }
      >

        <span className="island-marker">
          •
        </span>

        <span className="island-territory-info">

          <strong>
            Andaman & Nicobar Islands
          </strong>

          <small>
            Union Territory
          </small>

        </span>

        <span className="island-arrow">
          →
        </span>

      </button>
    );
  })()}

</div>


      </div>
      

    </div>
    
  );
}