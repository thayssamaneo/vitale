import 'package:flutter/foundation.dart';

import '../models/symptom_area.dart';

class SymptomSelectionController extends ChangeNotifier {
  final Set<SymptomArea> _selectedAreas = {};
  final Map<String, String> _severityByArea = {};

  List<SymptomArea> get selectedAreas => List.unmodifiable(_selectedAreas);

  Map<String, String> get severityByArea => Map.unmodifiable(_severityByArea);

  bool isSelected(SymptomArea area) => _selectedAreas.contains(area);

  String severityFor(SymptomArea area) =>
      _severityByArea[area.id] ?? 'Moderada';

  void toggle(SymptomArea area) {
    if (!_selectedAreas.add(area)) {
      _selectedAreas.remove(area);
      _severityByArea.remove(area.id);
    }
    notifyListeners();
  }

  void setSeverity(SymptomArea area, String severity) {
    if (!_selectedAreas.contains(area)) {
      return;
    }
    _severityByArea[area.id] = severity;
    notifyListeners();
  }

  void clear() {
    _selectedAreas.clear();
    _severityByArea.clear();
    notifyListeners();
  }
}
