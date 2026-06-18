from rouge_score import rouge_scorer
import matplotlib.pyplot as plt
import numpy as np

def evaluate_summarization():
    # 1. The summary a human would write (Your Ground Truth)
    reference_summary = """
1. Problem Overview
The document outlines the Department of Computer Science (AIML), focusing on its vision and mission to improve the educational environment and develop graduates with strong academic and technical backgrounds in computer science. The department aims to achieve excellence in areas such as workforce readiness, higher studies, and lifelong learning through industry collaboration and advanced computing practices.

2. Key Challenges

Education environment improvement and maintaining quality standards
Achieving excellence in workforce development, higher studies, and lifelong learning
Strengthening industry partnerships for collaboration and innovation
Applying academic knowledge to real-world domains like finance, healthcare, and e-commerce
Keeping the curriculum updated with modern technologies and research trends
Ensuring practical understanding along with theoretical knowledge

3. Strategy

Align vision and mission with academic goals and industry requirements
Define course objectives and outcomes aligned with B.Tech AIML curriculum
Develop a structured scheme and syllabus including subjects like Natural Language Processing
Include detailed units covering introduction to NLP, lexical analysis, syntax, semantic and pragmatic analysis
Incorporate language modeling techniques such as N-grams and transformer-based models
Integrate applications like information retrieval, sentiment analysis, machine translation, and text summarization
Provide updated textbooks and reference books for theoretical and practical learning
Encourage implementation of concepts through real-world projects and case studies
Continuously revise syllabus to include latest advancements in NLP and AI

4. Key Insights

The department focuses on continuous improvement of the educational environment
Strong emphasis on developing technical and academic skills in students
Course structure ensures understanding of core NLP concepts and techniques
Curriculum supports application of knowledge in real-world scenarios
Industry collaboration enhances practical exposure and innovation
    """

    # 2. The summary your NVIDIA NIM model actually generated
    generated_summary = """
    1. Problem Overview
The document outlines the Department of Information Technology (AIML) at a university, focusing on its vision and mission to enhance education environments by developing graduates with strong academic and technical backgrounds in computer science. The department aims to foster excellence across various domains such as workforce, higher studies or lifelong learning through industry partnerships.

2. Key Challenges
Education Environment Improvement: Enhancing the quality of educational environment.
Excellence in Various Domains: Achieving high standards in areas like workforce development, higher education, and lifelong learning.
Industry Partnerships: Strengthening connections with industries to drive innovation through collaborative projects.
Real-world Applications: Developing practical solutions that can be applied in various fields such as finance, healthcare, e-commerce, education, research, and beyond.
3. Strategy
Vision and Mission Alignment:

Ensure the department’s vision and mission are clearly communicated to students, faculty, and industry partners.
Course Objectives and Outcomes:

Develop course objectives that align with the curriculum requirements of B.Tech in Computer Science (AIML).
Outline specific outcomes for each objective, such as understanding core NLP concepts, applying POS tagging approaches, analyzing semantic and pragmatic analysis techniques, designing innovative NLP solutions.
Scheme and Syllabus:

Create a comprehensive scheme that includes elective courses like Natural Language Processing.
Develop a syllabus with detailed units covering topics from introduction to NLP, lexical analysis, semantic analysis, language modeling, applications of NLP in various fields, and practical projects.
Text Books and Reference Books:

Provide textbooks and reference books for students to study the theory and practice of NLP.
Include resources that are up-to-date with current research trends and industry practices.
Scheme and Syllabus (Continued):

Outline specific units on morphological analysis, lexical tagging, syntax parsing, semantic and pragmatic analysis techniques, language modeling, applications in information retrieval, sentiment analysis, text summarization, machine translation, etc.
Text & Reference Books (Continued):

List textbooks and reference books that cover the latest developments in NLP, including Python implementations for practical learning.
Scheme and Syllabus (Continued):

Provide a detailed syllabus with specific units on language modeling, applications of NLP in various fields, and projects to apply theoretical knowledge in real-world scenarios.
Text & Reference Books (Continued):

Include resources that cover the latest developments in NLP, including Python implementations for practical learning.
4. Key Insights
Vision and Mission: The department aims to continuously improve the educational environment by developing graduates with strong academic and technical backgrounds.
Course Objectives and Outcomes: Students will be able to understand core N
You can now ask me specific questions about the contents of this file.
    """

    # 3. Initialize the ROUGE scorer & Calculate the scores
    # ROUGE-1 (single words), ROUGE-2 (two-word phrases), ROUGE-L (longest matching sequences)
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    
    scores = scorer.score(reference_summary, generated_summary)

    # # 4. Print the results nicely
    # print("=== ROUGE Evaluation Results ===")
    # for metric, score in scores.items():
    #     print(f"\n{metric.upper()}:")
    #     print(f"  Precision (Accuracy): {score.precision:.4f}")
    #     print(f"  Recall (Completeness): {score.recall:.4f}")
    #     print(f"  F1-Score (Balance): {score.fmeasure:.4f}")

# 4. Prepare data for the graph
    metrics = ['rouge1', 'rouge2', 'rougeL']
    precision = [scores[m].precision for m in metrics]
    recall = [scores[m].recall for m in metrics]
    f1_score = [scores[m].fmeasure for m in metrics]

    # 5. Create the Plot
    x = np.arange(len(metrics))  # Label locations
    width = 0.25  # Width of the bars

    fig, ax = plt.subplots(figsize=(10, 6))

    # Add bars for each metric component
    rects1 = ax.bar(x - width, precision, width, label='Precision', color='#3498db')
    rects2 = ax.bar(x, recall, width, label='Recall', color='#2ecc71')
    rects3 = ax.bar(x + width, f1_score, width, label='F1-Score', color='#e74c3c')

    # Add labels and title
    ax.set_ylabel('Scores (0 to 1)')
    ax.set_title('ROUGE Metric Comparison: Reference vs Generated Summary')
    ax.set_xticks(x)
    ax.set_xticklabels([m.upper() for m in metrics])
    ax.legend()

    # Add text labels on top of the bars
    def autolabel(rects):
        for rect in rects:
            height = rect.get_height()
            ax.annotate(f'{height:.2f}',
                        xy=(rect.get_x() + rect.get_width() / 2, height),
                        xytext=(0, 3), 
                        textcoords="offset points",
                        ha='center', va='bottom')

    autolabel(rects1)
    autolabel(rects2)
    autolabel(rects3)

    plt.tight_layout()
    
    # Save the graph
    plt.savefig('rouge_results.png')
    print("Graph saved as 'rouge_results.png'")
    plt.show()

if __name__ == "__main__":
    evaluate_summarization()