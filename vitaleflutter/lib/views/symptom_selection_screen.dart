import 'package:material_ui/material_ui.dart';

import '../app/app_routes.dart';
import '../app/vitale_theme.dart';
import '../controllers/symptom_selection_controller.dart';
import '../models/patient_profile.dart';
import '../models/symptom_area.dart';
import '../models/triage_result.dart';
import 'widgets/step_header.dart';

class SymptomSelectionScreen extends StatefulWidget {
  const SymptomSelectionScreen({required this.profile, super.key});

  final PatientProfile profile;

  @override
  State<SymptomSelectionScreen> createState() => _SymptomSelectionScreenState();
}

class _SymptomSelectionScreenState extends State<SymptomSelectionScreen> {
  final _controller = SymptomSelectionController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _continue() {
    if (_controller.selectedAreas.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecione pelo menos uma região.')),
      );
      return;
    }

    Navigator.pushNamed(
      context,
      AppRoutes.recommendations,
      arguments: TriageResult(
        profile: widget.profile,
        selectedAreas: _controller.selectedAreas,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vitale'),
        leading: IconButton(
          tooltip: 'Voltar',
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back),
        ),
      ),
      body: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          final selectedCount = _controller.selectedAreas.length;
          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                  children: [
                    const StepHeader(
                      step: 2,
                      title: 'Onde você sente desconforto?',
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Olá, ${widget.profile.name}. Selecione uma ou mais regiões.',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: const Color(0xFF625D59),
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 18),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE5F6F3),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.touch_app_outlined,
                            color: VitaleTheme.primary,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              selectedCount == 0
                                  ? 'Toque nas regiões que deseja sinalizar.'
                                  : '$selectedCount '
                                        '${selectedCount == 1 ? 'região selecionada' : 'regiões selecionadas'}.',
                              style: const TextStyle(
                                color: Color(0xFF075E57),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    ...SymptomArea.all.map(
                      (area) => _SymptomAreaTile(
                        area: area,
                        selected: _controller.isSelected(area),
                        onTap: () => _controller.toggle(area),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Esta demonstração não realiza diagnóstico médico.',
                      style: TextStyle(color: Color(0xFF625D59), fontSize: 14),
                    ),
                  ],
                ),
              ),
              SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 16),
                  child: FilledButton.icon(
                    onPressed: _continue,
                    icon: const Icon(Icons.arrow_forward),
                    label: const Text('Ver orientações'),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _SymptomAreaTile extends StatelessWidget {
  const _SymptomAreaTile({
    required this.area,
    required this.selected,
    required this.onTap,
  });

  final SymptomArea area;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      clipBehavior: Clip.antiAlias,
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        leading: CircleAvatar(
          backgroundColor: selected
              ? const Color(0xFFD8F4F0)
              : const Color(0xFFF3EFEC),
          foregroundColor: selected ? VitaleTheme.primary : VitaleTheme.neutral,
          child: Icon(area.icon),
        ),
        title: Text(
          area.name,
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
        subtitle: Text(area.description),
        trailing: Checkbox(
          value: selected,
          onChanged: (_) => onTap(),
          activeColor: VitaleTheme.primary,
        ),
      ),
    );
  }
}
