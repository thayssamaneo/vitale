import 'package:flutter_test/flutter_test.dart';
import 'package:vitaleflutter/controllers/symptom_selection_controller.dart';
import 'package:vitaleflutter/models/symptom_area.dart';

void main() {
  group('SymptomSelectionController', () {
    final chest = SymptomArea.all.firstWhere((area) => area.id == 'chest');

    test('selecting a region lets the user record its intensity', () {
      final controller = SymptomSelectionController();

      controller.toggle(chest);
      controller.setSeverity(chest, 'Intensa');

      expect(controller.selectedAreas, contains(chest));
      expect(controller.severityFor(chest), 'Intensa');

      controller.dispose();
    });

    test('removing a region clears its intensity', () {
      final controller = SymptomSelectionController();

      controller.toggle(chest);
      controller.setSeverity(chest, 'Leve');
      controller.toggle(chest);

      expect(controller.selectedAreas, isEmpty);
      expect(controller.severityByArea, isEmpty);

      controller.dispose();
    });

    test('clear removes all selected regions and their intensities', () {
      final controller = SymptomSelectionController();

      for (final area in SymptomArea.all.take(2)) {
        controller.toggle(area);
        controller.setSeverity(area, 'Intensa');
      }

      controller.clear();

      expect(controller.selectedAreas, isEmpty);
      expect(controller.severityByArea, isEmpty);

      controller.dispose();
    });
  });
}
