import 'package:flutter/foundation.dart';

import '../models/symptom_area.dart';

class SymptomSelectionController extends ChangeNotifier {
  final Set<SymptomArea> _selectedAreas = {};

  List<SymptomArea> get selectedAreas => List.unmodifiable(_selectedAreas);

  bool isSelected(SymptomArea area) => _selectedAreas.contains(area);

  void toggle(SymptomArea area) {
    if (!_selectedAreas.add(area)) {
      _selectedAreas.remove(area);
    }
    notifyListeners();
  }
}
