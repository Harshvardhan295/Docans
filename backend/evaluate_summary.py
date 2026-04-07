from rouge_score import rouge_scorer

def evaluate_summarization():
    # 1. The summary a human would write (Your Ground Truth)
    reference_summary = """
    Problem Overview:
The education sector traditionally relies on a one-size-fits-all approach and manual administrative tasks that consume educators' time. Integrating Artificial Intelligence (AI) offers a transformative solution to reshape how knowledge is delivered and assessed, making education significantly more personalized, efficient, and accessible.

Key Challenges:

Ensuring data privacy and securely managing the large amounts of student information required for AI systems to function.
Mitigating algorithmic bias that could unintentionally favor or disadvantage specific groups of students based on training data.
Preventing a decline in the human interaction that is essential for the social and emotional development of learners.
Responsibly balancing technological innovation with the irreplaceable value of human educators.

Strategy:
Implement adaptive learning systems that analyze student metrics to customize flexible lesson plans in real-time.
Utilize AI-powered tools to automate the grading of multiple-choice questions, short answers, and essays to ensure unbiased evaluation.
Automate routine administrative tasks such as attendance tracking, scheduling, and generating performance reports.
Enhance educational materials by using AI to generate textbook summaries, quizzes, and explanations.
Deploy virtual tutors and chatbots to provide students with 24/7 academic assistance outside of regular classroom hours.

Key Insights:
AI enables a shift from rigid curricula to flexible, self-paced learning tailored to individual student strengths and weaknesses.
Automated grading drastically speeds up the feedback process while maintaining consistency.
By offloading logistical and administrative burdens to intelligent systems, educators can dedicate more time to active teaching and mentoring.
While AI has the potential to revolutionize education, stakeholders must implement it responsibly to protect privacy and maintain human connection.
    """

    # 2. The summary your Ollama model actually generated
    generated_summary = """
    Problem Overview: The document discusses the impact of artificial intelligence (AI) on education, highlighting its potential for transforming the traditional learning experience into one that is more personalized, efficient, and accessible.

Key Challenges:

Data privacy concerns.
Algorithmic bias risk.
Potential decline in human interaction due to increased reliance on machines.
Strategy:

Implement adaptive learning systems tailored to individual student needs.

Use AI for automated grading of multiple-choice questions and short-answer responses with high accuracy, ensuring consistent feedback.

Leverage AI for essay evaluation by examining grammar, structure, argument flow, and originality.

Automate administrative tasks such as attendance tracking, scheduling, communication with parents, and generating performance reports to free up teachers' time for teaching and mentoring students.

Enhance educational content generation through AI-assisted quizzes, explanations, and summaries of textbooks by publishers.

Utilize virtual tutors and chatbots that can provide 24/7 support outside regular classroom hours.

Key Insights:

AI enables a more flexible curriculum where students can learn at their own pace, revisit difficult concepts, and receive additional resources based on their strengths and weaknesses.
It speeds up the feedback process by evaluating essays with high accuracy, ensuring consistency and unbiased evaluation.
AI assists educators in administrative tasks such as attendance tracking, scheduling, communication with parents, and generating performance reports.
AI can enhance educational content generation through quizzes, explanations, and summaries of textbooks.
The integration of AI into education is not without challenges; data privacy concerns, algorithmic bias risks, and the potential decline in human interaction are significant issues that must be addressed responsibly.
    """

    # 3. Initialize the ROUGE scorer
    # ROUGE-1 (single words), ROUGE-2 (two-word phrases), ROUGE-L (longest matching sequences)
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    
    # 4. Calculate the scores
    scores = scorer.score(reference_summary, generated_summary)

    # 5. Print the results nicely
    print("=== ROUGE Evaluation Results ===")
    for metric, score in scores.items():
        print(f"\n{metric.upper()}:")
        print(f"  Precision (Accuracy): {score.precision:.4f}")
        print(f"  Recall (Completeness): {score.recall:.4f}")
        print(f"  F1-Score (Balance): {score.fmeasure:.4f}")

if __name__ == "__main__":
    evaluate_summarization()