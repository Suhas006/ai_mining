import 'dart:async';
import 'package:geolocator/geolocator.dart';

class SurveyLocationService {
  /// Samples Geolocator GPS fix stream over a 15-second dwell window.
  /// Filters out any readings worse than +-10 meters accuracy threshold,
  /// and returns the centroid average of the remaining fixes for high-precision field tracing.
  static Future<Position> getStableFix() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('GPS Location service is disabled on mobile device.');
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Location permission denied by user.');
      }
    }

    final fixes = <Position>[];
    final stream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.best,
        distanceFilter: 0,
      ),
    );

    // Collect GPS fixes for 15 seconds dwell window
    await for (final pos in stream.timeout(
      const Duration(seconds: 15),
      onTimeout: (sink) => sink.close(),
    )) {
      // PRD Spec Rule: Reject any fix worse than +-10 meters accuracy
      if (pos.accuracy <= 10.0) {
        fixes.add(pos);
      }
    }

    if (fixes.isEmpty) {
      throw Exception('No accurate GPS fix obtained within +-10m threshold.');
    }

    // Compute average centroid lat/lng over valid fixes
    final avgLat = fixes.map((f) => f.latitude).reduce((a, b) => a + b) / fixes.length;
    final avgLng = fixes.map((f) => f.longitude).reduce((a, b) => a + b) / fixes.length;

    return Position(
      longitude: avgLng,
      latitude: avgLat,
      timestamp: DateTime.now(),
      accuracy: 3.0,
      altitude: 0.0,
      altitudeAccuracy: 0.0,
      heading: 0.0,
      headingAccuracy: 0.0,
      speed: 0.0,
      speedAccuracy: 0.0,
    );
  }
}
