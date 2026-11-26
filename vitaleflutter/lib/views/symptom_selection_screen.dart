import 'package:firebase_auth/firebase_auth.dart';
import 'package:material_ui/material_ui.dart';

import '../app/app_routes.dart';
import '../app/vitale_theme.dart';
import '../controllers/auth_controller.dart';
import '../controllers/symptom_selection_controller.dart';
import '../models/patient_profile.dart';
import '../models/symptom_area.dart';
import '../models/triage_result.dart';
import '../repositories/assessment_repository.dart';
import 'widgets/body_diagram.dart';
import 'widgets/step_header.dart';

class SymptomSelectionScreen extends StatefulWidget {
  const SymptomSelectionScreen({required this.profile, super.key});

  final PatientProfile profile;

  @override
  State<SymptomSelectionScreen> createState() => _SymptomSelectionScreenState();
}

class _SymptomSelectionScreenState extends State<SymptomSelectionScreen> {
  final _controller = SymptomSelectionController();
  final _assessmentRepository = AssessmentRepository();
  final _authController = AuthController();
  bool _showBack = false;
  bool _isSavingAssessment = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _continue() async {
    if (_controller.selectedAreas.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecione pelo menos uma região.')),
      );
      return;
    }

    final result = TriageResult(
      profile: widget.profile,
      selectedAreas: _controller.selectedAreas,
      severityByArea: _controller.severityByArea,
    );

    setState(() => _isSavingAssessment = true);
    try {
      await _assessmentRepository.save(result);
    } on FirebaseException catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Não foi possível salvar esta avaliação (${error.code}). '
            'Você ainda pode continuar.',
          ),
        ),
      );
    } on StateError catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${error.message} A avaliação não foi salva.')),
      );
    } finally {
      if (mounted) {
        setState(() => _isSavingAssessment = false);
      }
    }

    if (!mounted) {
      return;
    }
    Navigator.pushNamed(context, AppRoutes.recommendations, arguments: result);
  }

  Future<void> _signOut() async {
    try {
      await _authController.signOut();
      if (!mounted) {
        return;
      }
      Navigator.pushNamedAndRemoveUntil(
        context,
        AppRoutes.login,
        (route) => false,
      );
    } on FirebaseAuthException catch (error) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(authErrorMessage(error))));
    }
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
        actions: [
          IconButton(
            tooltip: 'Sair da conta',
            onPressed: _signOut,
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          final selectedAreas = _controller.selectedAreas;
          final selectedCount = selectedAreas.length;
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
                    Card(
                      clipBehavior: Clip.antiAlias,
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
                        child: Column(
                          children: [
                            SegmentedButton<bool>(
                              segments: const [
                                ButtonSegment(
                                  value: false,
                                  icon: Icon(Icons.accessibility_new),
                                  label: Text('Frente'),
                                ),
                                ButtonSegment(
                                  value: true,
                                  icon: Icon(Icons.accessibility),
                                  label: Text('Costas'),
                                ),
                              ],
                              selected: {_showBack},
                              onSelectionChanged: (selection) {
                                setState(() => _showBack = selection.first);
                              },
                            ),
                            const SizedBox(height: 8),
                            BodyDiagram(
                              showBack: _showBack,
                              selectedAreas: selectedAreas.toSet(),
                              onAreaTap: _controller.toggle,
                            ),
                            const Text(
                              'Toque no corpo para marcar onde dói ou incomoda.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: Color(0xFF625D59),
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            selectedCount == 0
                                ? 'Nenhuma região selecionada'
                                : 'Regiões selecionadas ($selectedCount)',
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.w800),
                          ),
                        ),
                        if (selectedCount > 0)
                          TextButton(
                            onPressed: _controller.clear,
                            child: const Text('Limpar'),
                          ),
                      ],
                    ),
                    if (selectedCount == 0)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Text(
                          'As regiões que você marcar no desenho aparecerão aqui.',
                          style: TextStyle(color: Color(0xFF625D59)),
                        ),
                      ),
                    ...selectedAreas.map(
                      (area) => _SelectedAreaCard(
                        area: area,
                        severity: _controller.severityFor(area),
                        onSeverityChanged: (severity) {
                          if (severity.isEmpty) {
                            _controller.toggle(area);
                          } else {
                            _controller.setSeverity(area, severity);
                          }
                        },
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
                    onPressed: _isSavingAssessment ? null : _continue,
                    icon: _isSavingAssessment
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.arrow_forward),
                    label: Text(
                      _isSavingAssessment
                          ? 'Salvando avaliação...'
                          : 'Ver orientações',
                    ),
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

class _SelectedAreaCard extends StatelessWidget {
  const _SelectedAreaCard({
    required this.area,
    required this.severity,
    required this.onSeverityChanged,
  });

  final SymptomArea area;
  final String severity;
  final ValueChanged<String> onSeverityChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: const Color(0xFFD8F4F0),
                  foregroundColor: VitaleTheme.primary,
                  child: Icon(area.icon),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        area.name,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      Text(
                        area.description,
                        style: const TextStyle(color: Color(0xFF625D59)),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  tooltip: 'Remover ${area.name}',
                  onPressed: () => onSeverityChanged(''),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 14),
            const Text(
              'Qual a intensidade do desconforto?',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                for (final option in const ['Leve', 'Moderada', 'Intensa'])
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 3),
                      child: SizedBox(
                        height: 48,
                        child: severity == option
                            ? FilledButton(
                                onPressed: () => onSeverityChanged(option),
                                style: FilledButton.styleFrom(
                                  padding: EdgeInsets.zero,
                                ),
                                child: Text(option),
                              )
                            : OutlinedButton(
                                onPressed: () => onSeverityChanged(option),
                                style: OutlinedButton.styleFrom(
                                  padding: EdgeInsets.zero,
                                ),
                                child: Text(option),
                              ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
