import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import { MapLibre } from "../src/core/MapLibre";

const mapSpies = {
  flyTo: vi.fn(),
  easeTo: vi.fn()
};

const DEFAULT_MAPLIBRE_CSS_HREF =
  "https://cdn.jsdelivr.net/npm/maplibre-gl@5.18.0/dist/maplibre-gl.css";
let latestMapProps: Record<string, unknown> | null = null;

vi.mock("react-map-gl/maplibre", async () => {
  const reactModule = await import("react");

  const MockMap = reactModule.forwardRef<any, any>((props, ref) => {
    latestMapProps = props;

    reactModule.useImperativeHandle(ref, () => ({
      flyTo: mapSpies.flyTo,
      easeTo: mapSpies.easeTo,
      getBounds: () => ({
        getEast: () => 10,
        getWest: () => -10,
        getNorth: () => 10,
        getSouth: () => -10
      })
    }));

    return (
      <div
        data-testid="map"
        data-map-style={props.mapStyle}
        onClick={() => props.onClick?.({ lngLat: { lng: -111.91, lat: 40.76 } })}
      >
        {props.children}
      </div>
    );
  });

  MockMap.displayName = "MockMap";

  return {
    Map: MockMap,
    Marker: ({ children, latitude, longitude }: any) => (
      <div data-testid="marker" data-latitude={latitude} data-longitude={longitude}>
        {children}
      </div>
    ),
    NavigationControl: () => <div data-testid="navigation-control" />,
    GeolocateControl: () => <div data-testid="geolocate-control" />
  };
});

describe("MapLibre", () => {
  beforeEach(() => {
    mapSpies.flyTo.mockClear();
    mapSpies.easeTo.mockClear();

    document
      .querySelectorAll(
        "link#page-speed-maplibre-gl-css, link[data-page-speed-maps='maplibre-css']"
      )
      .forEach((element) => element.remove());
  });

  it("uses style key mapping with supplied stadia api key", () => {
    render(<MapLibre stadiaApiKey="abc123" mapStyle="osm-bright" />);

    const map = screen.getByTestId("map");
    expect(map).toHaveAttribute("data-map-style");
    expect(map.getAttribute("data-map-style")).toContain("api_key=abc123");
  });

  it("normalizes basic marker input coordinates", () => {
    render(
      <MapLibre
        stadiaApiKey="abc123"
        markers={[
          {
            id: "loc-1",
            latitude: 35.222,
            longitude: -80.841
          }
        ]}
      />
    );

    const marker = screen.getByTestId("marker");
    expect(marker).toHaveAttribute("data-latitude", "35.222");
    expect(marker).toHaveAttribute("data-longitude", "-80.841");
  });

  it("fires onClick callback with normalized coordinate shape", () => {
    const onClick = vi.fn();

    render(<MapLibre stadiaApiKey="abc123" onClick={onClick} />);
    fireEvent.click(screen.getByTestId("map"));

    expect(onClick).toHaveBeenCalledWith({
      latitude: 40.76,
      longitude: -111.91
    });
  });

  it("injects maplibre stylesheet automatically", () => {
    render(<MapLibre stadiaApiKey="abc123" />);

    const stylesheet = document.getElementById("page-speed-maplibre-gl-css");
    expect(stylesheet).toBeInTheDocument();
    expect(stylesheet).toHaveAttribute("rel", "stylesheet");
    expect(stylesheet).toHaveAttribute("href", DEFAULT_MAPLIBRE_CSS_HREF);
  });

  it("supports stylesheet href override", () => {
    const customHref = "https://example.com/custom-maplibre.css";

    render(<MapLibre stadiaApiKey="abc123" mapLibreCssHref={customHref} />);

    const stylesheet = document.getElementById("page-speed-maplibre-gl-css");
    expect(stylesheet).toBeInTheDocument();
    expect(stylesheet).toHaveAttribute("href", customHref);
  });

  it("injects the maplibre stylesheet only once", () => {
    render(
      <>
        <MapLibre stadiaApiKey="abc123" />
        <MapLibre stadiaApiKey="abc123" />
      </>
    );

    const stylesheets = document.querySelectorAll(
      "link#page-speed-maplibre-gl-css"
    );
    expect(stylesheets).toHaveLength(1);
  });

  it("does not re-flyTo when controlled state echoes rounded move updates", () => {
    function ControlledMap(): React.JSX.Element {
      const [viewState, setViewState] = React.useState({
        latitude: 33.4484012,
        longitude: -112.0740008,
        zoom: 12.345
      });

      return (
        <MapLibre
          stadiaApiKey="abc123"
          viewState={viewState}
          onViewStateChange={(nextState) => {
            setViewState((current) => ({ ...current, ...nextState }));
          }}
        />
      );
    }

    render(<ControlledMap />);
    expect(mapSpies.flyTo).not.toHaveBeenCalled();
    expect(latestMapProps).not.toBeNull();

    act(() => {
      (latestMapProps?.onMoveStart as (() => void) | undefined)?.();
    });
    act(() => {
      (latestMapProps?.onMove as
        | ((event: { viewState: { latitude: number; longitude: number; zoom: number } }) => void)
        | undefined)?.({
        viewState: {
          latitude: 33.4484016,
          longitude: -112.0740014,
          zoom: 12.3463
        }
      });
    });
    act(() => {
      (latestMapProps?.onMoveEnd as ((event: unknown) => void) | undefined)?.({});
    });

    expect(mapSpies.flyTo).not.toHaveBeenCalled();
  });

  it("flyTo's on meaningful external view state changes", () => {
    const { rerender } = render(
      <MapLibre
        stadiaApiKey="abc123"
        viewState={{ latitude: 33.4484, longitude: -112.074, zoom: 10 }}
      />
    );
    expect(mapSpies.flyTo).toHaveBeenCalledTimes(0);

    rerender(
      <MapLibre
        stadiaApiKey="abc123"
        viewState={{ latitude: 34.0522, longitude: -118.2437, zoom: 11.5 }}
      />
    );

    expect(mapSpies.flyTo).toHaveBeenCalledTimes(1);
  });
});
